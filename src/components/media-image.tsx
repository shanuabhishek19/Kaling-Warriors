import { ImageIcon, UserRound } from "lucide-react";

import { useMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
  fallback?: "image" | "avatar";
};

export function MediaImage({ src, alt, className, eager = false, fallback = "image" }: Props) {
  const { data: url, isPending } = useMediaUrl(src);

  if (!src || (!url && !isPending)) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-secondary text-muted-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {fallback === "avatar" ? <UserRound className="size-10" /> : <ImageIcon className="size-8" />}
      </div>
    );
  }

  if (!url) {
    return <div className={cn("animate-pulse bg-secondary", className)} aria-hidden="true" />;
  }

  return (
    <img
      src={url}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("object-cover", className)}
    />
  );
}
