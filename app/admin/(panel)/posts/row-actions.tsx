"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import { deletePostAction } from "./actions";

/** Tombol hapus artikel dengan dialog konfirmasi. */
export function PostRowActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onConfirm = async () => {
    setBusy(true);
    const result = await deletePostAction(id);
    setBusy(false);
    setOpen(false);
    if (result.ok) {
      toast("Artikel dihapus.", "success");
      router.refresh();
    } else {
      toast(result.error, "error");
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-admin-danger h-8 px-3 text-xs">
        Hapus
      </button>
      <ConfirmDialog
        open={open}
        title="Hapus artikel?"
        description={<>Artikel <strong>{title}</strong> akan dihapus permanen beserta komentarnya.</>}
        confirmLabel="Hapus"
        danger
        busy={busy}
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
