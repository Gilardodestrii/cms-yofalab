"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";
import { deleteUserAction } from "./actions";

/** Tombol hapus pengguna dengan dialog konfirmasi. */
export function UserRowActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onConfirm = async () => {
    setBusy(true);
    const result = await deleteUserAction(id);
    setBusy(false);
    setOpen(false);
    if (result.ok) {
      toast("Pengguna dihapus.", "success");
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
        title="Hapus pengguna?"
        description={<>Akun <strong>{name}</strong> akan dihapus permanen dan tidak bisa login lagi.</>}
        confirmLabel="Hapus"
        danger
        busy={busy}
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
