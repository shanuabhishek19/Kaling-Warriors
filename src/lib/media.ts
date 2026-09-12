import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

const PREFIX = "media:";
const BUCKET = "media";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateImage(file: File): string | null {
  if (!IMAGE_TYPES.has(file.type)) return "Use a JPG, PNG or WebP image.";
  if (file.size > MAX_IMAGE_SIZE) return "Images must be 5 MB or smaller.";
  return null;
}

export async function optimizeImage(file: File): Promise<File> {
  const error = validateImage(file);
  if (error) throw new Error(error);
  if (typeof createImageBitmap === "undefined") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.86),
  );
  if (!blob) return file;
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
    type: "image/jpeg",
  });
}

/** Uploads a file to the media bucket and returns a storage reference string. */
export async function uploadMedia(file: File, folder: string): Promise<string> {
  const error = validateImage(file);
  if (error) throw new Error(error);
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const uploadResult = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadResult.error) throw uploadResult.error;
  return `${PREFIX}${path}`;
}

export async function removeMedia(reference: string | null | undefined) {
  if (!reference?.startsWith(PREFIX)) return;
  const path = reference.slice(PREFIX.length);
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export function mediaPath(reference: string | null | undefined): string | null {
  return reference?.startsWith(PREFIX) ? reference.slice(PREFIX.length) : null;
}

export async function resolveMediaUrl(
  reference: string | null | undefined,
): Promise<string | null> {
  if (!reference) return null;
  if (!reference.startsWith(PREFIX)) return reference;
  const path = reference.slice(PREFIX.length);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export function useMediaUrl(reference: string | null | undefined) {
  return useQuery({
    queryKey: ["media", reference],
    queryFn: () => resolveMediaUrl(reference),
    enabled: Boolean(reference),
    staleTime: 1000 * 60 * 60,
  });
}
