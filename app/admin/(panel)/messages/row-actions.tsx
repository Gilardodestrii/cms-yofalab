"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import { deleteMessageAction, setMessageStatusAction } from "./actions";

/** Aksi pesan: ubah status (Baru/Dibaca/Ditindaklanjuti) + hapus. */
export function MessageRowActions({
  id,
  status,
  senderName,
}: {
  id: string;
  status: "NEW" | "READ" | "FOLLOWED_UP";
  senderName: string;
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
        {status !== "READ" && (
          <button type="button" className={btn} disabled={busy} onClick={() => run(() => setMessageStatusAction(id, "READ"), "Ditandai dibaca.")}>
            Dibaca
          </button>
        )}
        {status !== "FOLLOWED_UP" && (
          <button type="button" className={btn} disabled={busy} onClick={() => run(() => setMessageStatusAction(id, "FOLLOWED_UP"), "Ditandai ditindaklanjuti.")}>
            Tindak lanjut
          </button>
        )}
        {status !== "NEW" && (
          <button type="button" className={btn} disabled={busy} onClick={() => run(() => setMessageStatusAction(id, "NEW"), "Dikembalikan ke Baru.")}>
            Baru
          </button>
        )}
        <button type="button" className="btn-admin-danger h-8 px-3 text-xs" disabled={busy} onClick={() => setConfirmOpen(true)}>
          Hapus
        </button>
      </span>
      <ConfirmDialog
        open={confirmOpen}
        title="Hapus pesan?"
        description={<>Pesan dari <strong>{senderName}</strong> akan dihapus permanen.</>}
        confirmLabel="Hapus"
        danger
        busy={busy}
        onConfirm={() => run(() => deleteMessageAction(id), "Pesan dihapus.")}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
