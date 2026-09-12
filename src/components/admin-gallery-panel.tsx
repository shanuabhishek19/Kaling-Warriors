import { useState, type FormEvent } from "react";
import { ImagePlus, Save, Trash2 } from "lucide-react";
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
import { GALLERY_CATEGORIES, type GalleryItem } from "@/lib/queries";
import { optimizeImage, removeMedia, uploadMedia } from "@/lib/media";
import { supabase } from "@/integrations/supabase/client";

export function AdminGalleryPanel({
  items,
  onRefresh,
}: {
  items: GalleryItem[];
  onRefresh: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("image") as File | null;
    if (!file?.size) {
      toast.error("Choose a photo first.");
      return;
    }
    setSaving(true);
    try {
      const imageUrl = await uploadMedia(await optimizeImage(file), "gallery");
      const result = await supabase.from("gallery").insert({
        title: String(form.get("title") ?? "").trim(),
        category: String(form.get("category") ?? "Match"),
        image_url: imageUrl,
        sort_order: items.length,
      });
      if (result.error) {
        await removeMedia(imageUrl);
        throw new Error(result.error.message);
      }
      toast.success("Photo added to gallery");
      setOpen(false);
      await onRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not add photo",
      );
    } finally {
      setSaving(false);
    }
  }
  async function remove(item: GalleryItem) {
    if (
      !window.confirm(
        "Are you sure you want to remove this photo? This action cannot be undone.",
      )
    )
      return;
    const result = await supabase.from("gallery").delete().eq("id", item.id);
    if (result.error) toast.error(result.error.message);
    else {
      await removeMedia(item.image_url);
      await onRefresh();
    }
  }
  return (
    <>
      <div className="mb-7 flex flex-col gap-4 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.28em] text-primary">
            Club moments
          </p>
          <h1 className="display-title mt-2 text-4xl sm:text-5xl">Gallery</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Add match, team, trophy, ground and training photos.
          </p>
        </div>
        <Button onClick={() => setOpen((value) => !value)}>
          <ImagePlus className="size-4" /> Add photo
        </Button>
      </div>
      {open ? (
        <form
          onSubmit={save}
          className="mb-6 grid gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="gallery-image">Photo</Label>
            <Input
              id="gallery-image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gallery-title">Title</Label>
            <Input id="gallery-title" name="title" placeholder="Final day" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select name="category" defaultValue="Match">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GALLERY_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button disabled={saving}>
              <Save className="size-4" />{" "}
              {saving ? "Uploading..." : "Save photo"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-border bg-card/50"
          >
            <MediaImage
              src={item.image_url}
              alt={item.title || `${item.category} photo`}
              className="aspect-video w-full"
            />
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{item.title || "Untitled photo"}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Remove ${item.title || "photo"}`}
                className="text-destructive"
                onClick={() => void remove(item)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            No photos yet.
          </div>
        ) : null}
      </div>
    </>
  );
}
