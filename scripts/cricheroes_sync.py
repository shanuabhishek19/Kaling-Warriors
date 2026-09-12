"""Sync public CricHeroes team data into Supabase.

This worker intentionally updates only source-owned fields. Admin-owned player
roles, bios, jersey numbers, and club settings remain unchanged.
"""
from __future__ import annotations

import os
import re
import sys
import time
import base64
import json
from dataclasses import dataclass
from datetime import date, datetime
from typing import Any

from bs4 import BeautifulSoup
import requests
from selenium import webdriver

TEAM_URL = os.environ.get("CRICHEROES_TEAM_URL", "12483791/kalinga-warriors")
SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]


@dataclass
class SourcePlayer:
    name: str
    profile_pic_url: str | None
    profile_url: str | None = None


@dataclass
class SourceMatch:
    match_date: date
    tournament: str
    venue: str
    result: str
    score: str
    url: str


def headers() -> dict[str, str]:
    return {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }


def request(method: str, table: str, payload: Any, params: str = "") -> None:
    response = requests.request(
        method,
        f"{SUPABASE_URL}/rest/v1/{table}{params}",
        headers=headers(),
        json=payload,
        timeout=30,
    )
    response.raise_for_status()


def team_url(path: str) -> str:
    return f"https://cricheroes.com/team-profile/{TEAM_URL.strip('/')}/{path}"


def page_source(driver: webdriver.Chrome, path: str) -> BeautifulSoup:
    driver.get(team_url(path))
    time.sleep(2)
    return BeautifulSoup(driver.page_source, "html.parser")


def load_authenticated_session(driver: webdriver.Chrome) -> None:
    encoded = os.environ.get("CRICHEROES_COOKIES_B64", "").strip()
    if not encoded:
        return
    payload = json.loads(base64.b64decode(encoded).decode("utf-8"))
    cookies = payload.get("cookies", []) if isinstance(payload, dict) else payload
    driver.get("https://cricheroes.com/")
    for cookie in cookies:
        driver.add_cookie(
            {
                key: cookie[key]
                for key in ("name", "value", "domain", "path", "expiry", "secure", "httpOnly", "sameSite")
                if key in cookie
            }
        )
    driver.refresh()
    print("Loaded authenticated CricHeroes session.")


def parse_players(soup: BeautifulSoup) -> list[SourcePlayer]:
    players = []
    for card in soup.select("div.card"):
        name = card.select_one(".topRow span")
        if not name:
            continue
        image = card.select_one('img[alt="profile"]')
        players.append(
            SourcePlayer(
                name=name.get_text(" ", strip=True),
                profile_pic_url=image.get("src") if image else None,
            )
        )
    return players


def parse_matches(soup: BeautifulSoup) -> list[SourceMatch]:
    matches = []
    for card in soup.select('a[href*="/match-detail/"]'):
        text = card.get_text(" ", strip=True)
        match_date = re.search(r"\b\d{2}-[A-Za-z]{3}-\d{2}\b", text)
        if not match_date:
            continue
        teams = [team.get_text(" ", strip=True) for team in card.select(".teamNameText")]
        opponent = next((team for team in teams if team.upper() != "KALINGA WARRIORS"), "")
        info = card.select_one(".matchInfo p")
        result = card.select_one(".bottomInfo")
        tournament = card.select_one(".tournamentName")
        matches.append(
            SourceMatch(
                match_date=datetime.strptime(match_date.group(), "%d-%b-%y").date(),
            tournament=tournament.get_text(" ", strip=True) if tournament else "CricHeroes fixture",
                venue=info.get_text(" ", strip=True).split(",")[0] if info else "",
                result=result.get_text(" ", strip=True) if result else "",
                score="",
                url="https://cricheroes.com" + card.get("href", ""),
            )
        )
    return matches


def get_source() -> dict[str, Any]:
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    driver = webdriver.Chrome(options=options)
    try:
        load_authenticated_session(driver)
        members = page_source(driver, "members")
        matches = page_source(driver, "matches")
        name = next(
            (value.strip() for value in members.find_all(string=True) if value.strip() == "KALINGA WARRIORS"),
            TEAM_URL.rsplit("/", 1)[-1].replace("-", " ").title(),
        )
        logo = members.select_one('img[alt="profile picture"]')
        return {
            "team_name": name,
            "team_logo": logo.get("src") if logo else None,
            "players": parse_players(members),
            "matches": parse_matches(matches),
        }
    finally:
        driver.quit()


def sync() -> None:
    source = get_source()

    team_name = str(source.get("team_name") or "").strip()
    logo = str(source.get("team_logo") or "").strip() or None
    if team_name:
        request(
            "PATCH",
            "team_settings",
            {"team_name": team_name, "cricheroes_team_url": TEAM_URL, "cricheroes_last_synced_at": datetime.utcnow().isoformat() + "Z"},
            "?id=eq." + os.environ.get("TEAM_SETTINGS_ID", ""),
        )

    for player in source.get("players", []):
        name = str(getattr(player, "name", "")).strip()
        if not name:
            continue
        photo = str(getattr(player, "profile_pic_url", "")).strip() or None
        request(
            "POST",
            "players",
            {"name": name, "photo_url": photo, "cricheroes_profile_url": getattr(player, "profile_url", None), "cricheroes_last_synced_at": datetime.utcnow().isoformat() + "Z"},
            "?on_conflict=cricheroes_profile_url",
        )

    for match in source.get("matches", []):
        match_date = getattr(match, "match_date", None)
        if not isinstance(match_date, date):
            continue
        request(
            "POST",
            "matches",
            {"opponent": str(getattr(match, "tournament", "CricHeroes fixture")), "match_date": match_date.isoformat(), "venue": str(getattr(match, "venue", "")) or "TBC", "result": str(getattr(match, "result", "")) or None, "summary": str(getattr(match, "score", "")) or None, "cricheroes_match_url": getattr(match, "url", None), "cricheroes_last_synced_at": datetime.utcnow().isoformat() + "Z"},
            "?on_conflict=cricheroes_match_url",
        )

    print(f"Synced CricHeroes team data for {TEAM_URL}")


if __name__ == "__main__":
    try:
        sync()
    except Exception as error:
        print(f"CricHeroes sync failed safely: {error}", file=sys.stderr)
        sys.exit(1)
