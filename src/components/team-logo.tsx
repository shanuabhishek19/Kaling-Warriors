import fallbackLogo from "@/assets/team-logo.png";
import { useMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  reference?: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

export function TeamLogo({
  reference,
  alt,
  className,
  width = 40,
  height = 40,
}: Props) {
  const { data: url } = useMediaUrl(reference);
  return (
    <img
      src={url ?? fallbackLogo}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-contain", className)}
    />
  );
}
