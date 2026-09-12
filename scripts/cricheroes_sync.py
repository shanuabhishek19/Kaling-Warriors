"""Sync public CricHeroes team data into Supabase.

This worker intentionally updates only source-owned fields. Admin-owned player
roles, bios, jersey numbers, and club settings remain unchanged.
"""
from __future__ import annotations

import os
import sys
from datetime import date, datetime
from typing import Any

import requests
from cricheroes import Team

TEAM_URL = os.environ.get("CRICHEROES_TEAM_URL", "12483791/kalinga-warriors")
SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]


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


def sync() -> None:
    # The published package defaults to cricheroes.in; the supplied profile is
    # on cricheroes.com, so override its base URL before constructing Team.
    Team.BASE_URL = "https://cricheroes.com/team-profile"
    source = Team(url=TEAM_URL).fetch_all_data()

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
