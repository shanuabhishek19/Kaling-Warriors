import { useEffect, useState, type FormEvent } from "react";
import { FilePlus2, ImagePlus, Save, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";

import { MediaImage } from "@/components/media-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui-bits";
import {
  ADDITIONAL_PLAYER_ROLES,
  BATTING_STYLES,
  BOWLING_STYLES,
  PLAYER_ROLES,
  type Player,
} from "@/lib/queries";
import { optimizeImage, removeMedia, uploadMedia } from "@/lib/media";
import { supabase } from "@/integrations/supabase/client";

export function AdminPlayersPanel({
  players,
  onRefresh,
}: {
  players: Player[];
  onRefresh: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<Player | null>(null);
  const [working, setWorking] = useState<string | null>(null);

  return (
    <>
      <div className="mb-7 flex flex-col gap-4 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.28em] text-primary">
            Squad room
          </p>
          <h1 className="display-title mt-2 text-4xl sm:text-5xl">Players</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Keep every player profile, leadership role and playing style
            current.
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              id: "",
              name: "",
              jersey_number: null,
              role: PLAYER_ROLES[0] ?? "Batsman",
              additional_role: "None",
              batting_style: BATTING_STYLES[0] ?? "Right-Hand Batsman",
              bowling_style:
                BOWLING_STYLES[BOWLING_STYLES.length - 1] ??
                "None / Does Not Bowl",
              bio: null,
              photo_url: null,
              matches: 0,
              runs: 0,
              wickets: 0,
              sort_order: players.length,
              created_at: "",
              updated_at: "",
            })
          }
        >
          <UserRoundPlus className="size-4" /> Add player
        </Button>
      </div>
      {editing ? (
        <PlayerForm
          player={editing.id ? editing : null}
          players={players}
          onCancel={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await onRefresh();
          }}
        />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="rounded-xl border border-border bg-card/50 p-5"
          >
            <div className="flex gap-4">
              <MediaImage
                src={player.photo_url}
                alt={player.name}
                fallback="avatar"
                className="size-16 shrink-0 rounded-full"
              />
              <div className="min-w-0">
                <p className="truncate font-heading text-xl uppercase">
                  {player.name}
                </p>
                <p className="mt-1 text-sm text-primary">{player.role}</p>
                {player.additional_role !== "None" ? (
                  <StatusBadge status={player.additional_role} />
                ) : null}
              </div>
              <span className="ml-auto font-heading text-2xl text-muted-foreground">
                #{player.jersey_number ?? "-"}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
              <div>
                <p className="font-heading text-lg">{player.matches}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Matches
                </p>
              </div>
              <div>
                <p className="font-heading text-lg">{player.runs}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Runs
                </p>
              </div>
              <div>
                <p className="font-heading text-lg">{player.wickets}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Wickets
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(player)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={working === player.id}
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Remove this player? This action cannot be undone.",
                    )
                  )
                    return;
                  setWorking(player.id);
                  const result = await supabase
                    .from("players")
                    .delete()
                    .eq("id", player.id);
                  setWorking(null);
                  if (result.error) toast.error(result.error.message);
                  else await onRefresh();
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        {players.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
            No squad profiles yet.
          </div>
        ) : null}
      </div>
    </>
  );
}

function PlayerForm({
  player,
  players,
  onCancel,
  onSaved,
}: {
  player: Player | null;
  players: Player[];
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [role, setRole] = useState(player?.role ?? PLAYER_ROLES[0]);
  const [additionalRole, setAdditionalRole] = useState(
    player?.additional_role ?? "None",
  );
  const [battingStyle, setBattingStyle] = useState(
    player?.batting_style ?? BATTING_STYLES[0] ?? "Right-Hand Batsman",
  );
  const [bowlingStyle, setBowlingStyle] = useState(
    player?.bowling_style ??
      BOWLING_STYLES[BOWLING_STYLES.length - 1] ??
      "None / Does Not Bowl",
  );
  const [preview, setPreview] = useState<string | null>(
    player?.photo_url ?? null,
  );
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) {
      toast.error("Player name is required.");
      return;
    }
    const opposite =
      additionalRole === "Captain"
        ? "Vice Captain"
        : additionalRole === "Vice Captain"
          ? "Captain"
          : null;
    if (opposite && player?.additional_role === opposite) {
      toast.error("A player cannot be both Captain and Vice Captain.");
      return;
    }
    const existing = players.find(
      (item) =>
        item.additional_role === additionalRole && item.id !== player?.id,
    );
    if (
      existing &&
      additionalRole !== "None" &&
      !window.confirm(
        `A ${additionalRole} is already assigned to ${existing.name}. Do you want to replace the current ${additionalRole}?`,
      )
    )
      return;
    setSaving(true);
    try {
      const file = form.get("photo") as File | null;
      let photoUrl = player?.photo_url ?? null;
      if (removePhoto) photoUrl = null;
      if (file?.size)
        photoUrl = await uploadMedia(await optimizeImage(file), "players");
      const payload = {
        name,
        jersey_number: Number(form.get("jersey_number")) || null,
        role,
        batting_style: battingStyle,
        bowling_style: bowlingStyle,
        bio: String(form.get("bio") ?? "").trim() || null,
        photo_url: photoUrl,
      };
      const result = player
        ? await supabase.from("players").update(payload).eq("id", player.id)
        : await supabase.from("players").insert(payload).select("id").single();
      if (result.error) throw new Error(result.error.message);
      const playerId = player?.id ?? result.data?.id;
      if (playerId) {
        const leadership = await supabase.rpc("assign_player_leadership", {
          _player_id: playerId,
          _additional_role: additionalRole,
        });
        if (leadership.error) throw new Error(leadership.error.message);
      }
      if (
        (removePhoto || (file?.size && player?.photo_url)) &&
        player?.photo_url &&
        player.photo_url !== photoUrl
      )
        await removeMedia(player.photo_url);
      toast.success(player ? "Player updated" : "Player added");
      await onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save player",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="mb-6 grid gap-5 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <p className="font-heading text-xs uppercase tracking-widest text-primary">
          Player details
        </p>
      </div>
      <Field
        name="name"
        label="Player name"
        defaultValue={player?.name ?? ""}
        required
      />
      <Field
        name="jersey_number"
        label="Jersey number"
        type="number"
        defaultValue={player?.jersey_number ?? ""}
      />
      <div className="space-y-2">
        <Label htmlFor="photo">Profile picture</Label>
        <div className="flex items-center gap-3">
          <MediaImage
            src={preview}
            alt="Preview"
            fallback="avatar"
            className="size-14 rounded-full"
          />
          <Input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
                setPreview(URL.createObjectURL(file));
                setRemovePhoto(false);
              }
            }}
          />
        </div>
        {player?.photo_url ? (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={removePhoto}
              onChange={(event) => setRemovePhoto(event.target.checked)}
            />{" "}
            Remove current image
          </label>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Short bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={player?.bio ?? ""}
          rows={3}
        />
      </div>
      <div className="sm:col-span-2">
        <p className="font-heading text-xs uppercase tracking-widest text-primary">
          Playing details
        </p>
      </div>
      <SelectField
        name="role"
        label="Primary role"
        value={role}
        values={PLAYER_ROLES}
        onChange={setRole}
      />
      <SelectField
        name="additional_role"
        label="Additional role"
        value={additionalRole}
        values={ADDITIONAL_PLAYER_ROLES}
        onChange={setAdditionalRole}
      />
      <SelectField
        name="batting_style"
        label="Batting style"
        value={battingStyle}
        values={BATTING_STYLES}
        onChange={setBattingStyle}
      />
      <SelectField
        name="bowling_style"
        label="Bowling style"
        value={bowlingStyle}
        values={BOWLING_STYLES}
        onChange={setBowlingStyle}
      />
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={saving}>
          <Save className="size-4" /> {saving ? "Saving..." : "Save player"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  );
}
function SelectField({
  name,
  label,
  value,
  values,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  values: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} value={value} onValueChange={onChange}>
        <SelectTrigger id={name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {values.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
