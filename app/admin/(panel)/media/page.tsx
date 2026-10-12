import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import { MediaManager, type MediaRow } from "./media-manager";

export const metadata: Metadata = {
  title: "Media",
  robots: { index: false, follow: false },
};

/** Halaman Media (`/admin/media`). Berhak: Super Admin & Editor. */
export default async function AdminMediaPage() {
  await requireRole(CONTENT_ROLES, "/admin/media");

  const media = await db.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      path: true,
      fileName: true,
      altText: true,
      mimeType: true,
      size: true,
      width: true,
      height: true,
      createdAt: true,
    },
  });

  const items: MediaRow[] = media.map((m) => ({
    id: m.id.toString(),
    path: m.path,
    fileName: m.fileName,
    altText: m.altText,
    mimeType: m.mimeType,
    size: m.size,
    width: m.width,
    height: m.height,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: "Dashboard", href: "/admin" }, { label: "Media" }]}
      />
      <div>
        <h1 className="font-heading text-lg font-semibold text-ink-900">
          Media
        </h1>
        <p className="mt-1 font-body text-sm text-ink-600">
          Kelola gambar dan dokumen yang dipakai di seluruh situs.
        </p>
      </div>
      <MediaManager items={items} />
    </div>
  );
}