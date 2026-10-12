"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import { deleteCommentAction, setCommentStatusAction } from "./actions";

/** Aksi moderasi komentar: setujui, tolak (pending), spam, hapus. */
export function CommentRowActions({
  id,
  status,
  authorName,
}: {
  id: string;
  status: "PENDING" | "APPROVED" | "SPAM";
  authorName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const run = async (
    fn: () => Promise<{ ok: true } | { ok: false; error: string }>,
    successMessage: string,
  ) => {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (result.ok) {
      toast(successMessage, "success");
      router.refresh();
    } else {
      toast(result.error, "error");
    }
  };

  const btn = "btn-admin-secondary h-8 px-3 text-xs";

  return (
    <>
      <span className="flex flex-wrap gap-2">
        {status !== "APPROVED" && (
          <button
            type="button"
            className={btn}
            disabled={busy}
            onClick={() => run(() => setCommentStatusAction(id, "APPROVED"), "Komentar disetujui.")}
          >
            Setujui
          </button>
        )}
        {status !== "PENDING" && (
          <button
            type="button"
            className={btn}
            disabled={busy}
            onClick={() => run(() => setCommentStatusAction(id, "PENDING"), "Komentar ditolak (menunggu).")}
          >
            Tolak
          </button>
        )}
        {status !== "SPAM" && (
          <button
            type="button"
            className={btn}
            disabled={busy}
            onClick={() => run(() => setCommentStatusAction(id, "SPAM"), "Ditandai spam.")}
          >
            Spam
          </button>
        )}
        <button
          type="button"
          className="btn-admin-danger h-8 px-3 text-xs"
          disabled={busy}
          onClick={() => setConfirmOpen(true)}
        >
          Hapus
        </button>
      </span>
      <ConfirmDialog
        open={confirmOpen}
        title="Hapus komentar?"
        description={<>Komentar dari <strong>{authorName}</strong> akan dihapus permanen.</>}
        confirmLabel="Hapus"
        danger
        busy={busy}
        onConfirm={() => run(() => deleteCommentAction(id), "Komentar dihapus.")}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
