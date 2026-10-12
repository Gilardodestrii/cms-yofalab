import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { ADMIN_BASE_ROLES } from "@/lib/auth/roles";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { MessageRowActions } from "../row-actions";
import { MessageNoteForm } from "../note-form";
import { saveMessageNoteAction } from "../actions";

export const metadata: Metadata = {
  title: "Detail Pesan",
  robots: { index: false, follow: false },
};

const STATUS_LABEL = { NEW: "Baru", READ: "Dibaca", FOLLOWED_UP: "Ditindaklanjuti" } as const;
const STATUS_VARIANT = { NEW: "warning", READ: "info", FOLLOWED_UP: "success" } as const;

function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(d);
}

/** Detail pesan kontak (`/admin/messages/[id]`) + catatan internal. */
export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ADMIN_BASE_ROLES, "/admin/messages");

  const { id } = await params;
  let messageId: bigint;
  try {
    messageId = BigInt(id);
  } catch {
    notFound();
  }

  const message = await db.contactMessage.findUnique({ where: { id: messageId! } });
  if (!message) notFound();

  const noteAction = saveMessageNoteAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Pesan Kontak", href: "/admin/messages" },
          { label: "Detail" },
        ]}
      />

      <div className="panel-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-lg font-semibold text-ink-900">
              {message.subject || "(tanpa subjek)"}
            </h1>
            <p className="mt-1 font-body text-sm text-ink-600">
              Dari <strong>{message.name}</strong> ·{" "}
              <a href={`mailto:${message.email}`} className="text-brand-600 hover:underline">
                {message.email}
              </a>
            </p>
            <p className="mt-1 font-body text-xs text-ink-400">{formatDateTime(message.createdAt)}</p>
          </div>
          <Badge variant={STATUS_VARIANT[message.status]}>{STATUS_LABEL[message.status]}</Badge>
        </div>

        <div className="mt-5 whitespace-pre-line rounded-sm bg-surface-muted p-4 font-body text-sm text-ink-900">
          {message.message}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <MessageRowActions id={id} status={message.status} senderName={message.name} />
          <a
            href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject ?? "Pesan Anda"}`)}`}
            className="btn-admin-secondary"
          >
            Balas via email
          </a>
        </div>
      </div>

      <MessageNoteForm action={noteAction} initialNote={message.internalNote ?? ""} />

      <Link href="/admin/messages" className="font-body text-sm text-brand-600 hover:underline">
        ← Kembali ke daftar pesan
      </Link>
    </div>
  );
}
