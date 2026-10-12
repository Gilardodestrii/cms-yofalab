import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import { PostForm } from "../post-form";
import { createPostAction } from "../actions";

export const metadata: Metadata = {
  title: "Tulis Artikel",
  robots: { index: false, follow: false },
};

/** Formulir tulis artikel baru. */
export default async function NewPostPage() {
  await requireRole(CONTENT_ROLES, "/admin/posts/new");

  const categories = await db.postCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/posts" },
          { label: "Tulis" },
        ]}
      />
      <h1 className="font-heading text-lg font-semibold text-ink-900">Tulis Artikel</h1>
      <PostForm
        action={createPostAction}
        categories={categories.map((c) => ({ id: c.id.toString(), name: c.name }))}
      />
    </div>
  );
}
