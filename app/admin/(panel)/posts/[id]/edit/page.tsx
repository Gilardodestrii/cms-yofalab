import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { CONTENT_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { db } from "@/lib/db";
import { PostForm, toDatetimeLocal } from "../../post-form";
import { updatePostAction } from "../../actions";

export const metadata: Metadata = {
  title: "Ubah Artikel",
  robots: { index: false, follow: false },
};

/** Formulir ubah artikel. */
export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(CONTENT_ROLES, "/admin/posts");

  const { id } = await params;
  let postId: bigint;
  try {
    postId = BigInt(id);
  } catch {
    notFound();
  }

  const [post, categories] = await Promise.all([
    db.post.findUnique({
      where: { id: postId! },
      select: {
        title: true,
        categoryId: true,
        excerpt: true,
        content: true,
        coverMediaId: true,
        status: true,
        publishedAt: true,
        seoTitle: true,
        seoDescription: true,
        cover: { select: { fileName: true } },
      },
    }),
    db.postCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!post) notFound();

  const action = updatePostAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Blog", href: "/admin/posts" },
          { label: "Ubah" },
        ]}
      />
      <h1 className="font-heading text-lg font-semibold text-ink-900">
        Ubah Artikel: {post.title}
      </h1>
      <PostForm
        action={action}
        categories={categories.map((c) => ({ id: c.id.toString(), name: c.name }))}
        initial={{
          title: post.title,
          categoryId: post.categoryId?.toString() ?? "",
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverMediaId: post.coverMediaId?.toString() ?? "",
          coverName: post.cover?.fileName ?? "",
          status: post.status,
          publishedAt: toDatetimeLocal(post.publishedAt),
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
        }}
      />
    </div>
  );
}
