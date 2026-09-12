import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { MediaImage } from "@/components/media-image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CardSkeletons, EmptyState, SectionHeading } from "@/components/ui-bits";
import { GALLERY_CATEGORIES, galleryQuery, type GalleryItem } from "@/lib/queries";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery — Kalinga Warriors" },
      {
        name: "description",
        content:
          "Match action, team moments, trophies and ground shots from Kalinga Warriors's photo gallery.",
      },
      { property: "og:title", content: "Photo Gallery — Kalinga Warriors" },
      { property: "og:description", content: "Match, team, trophy and ground photos." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: items, isPending } = useQuery(galleryQuery);
  const [category, setCategory] = useState<string>("All");
  const [active, setActive] = useState<GalleryItem | null>(null);

  const filtered = useMemo(
    () => (items ?? []).filter((item) => category === "All" || item.category === category),
    [items, category],
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Moments"
        title="Gallery"
        description="Action from the middle, celebrations and life around the club."
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {["All", ...GALLERY_CATEGORIES].map((option) => (
          <Button
            key={option}
            size="sm"
            variant={category === option ? "default" : "secondary"}
            className="font-heading uppercase tracking-wide"
            onClick={() => setCategory(option)}
          >
            {option}
          </Button>
        ))}
      </div>

      <div className="mt-8">
        {isPending ? (
          <CardSkeletons count={6} />
        ) : filtered.length ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item)}
                className="hover-lift mb-4 block w-full overflow-hidden rounded-xl border border-border"
              >
                <MediaImage
                  src={item.image_url}
                  alt={item.title || `${item.category} photo`}
                  className="w-full"
                />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ImageIcon}
            title="No photos yet"
            description="Photos added by club admins will show up here."
          />
        )}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => (!open ? setActive(null) : undefined)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle className="display-title text-xl">
            {active?.title || active?.category}
          </DialogTitle>
          {active ? (
            <MediaImage
              src={active.image_url}
              alt={active.title || `${active.category} photo`}
              eager
              className="max-h-[70vh] w-full rounded-lg"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
