import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "../ui/dialog";
import { Button } from "../ui/button";

interface ConfirmDeleteDialogProps {
    onConfirm: () => void;
}

export default function ConfirmDeleteDialog({ onConfirm }: ConfirmDeleteDialogProps) {
    return (
        <DialogContent className="w-full max-w-[min(90vw, 300px)]">
            <DialogHeader>
                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                <DialogDescription>
                    Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end gap-2">
                <DialogClose asChild>
                    <Button variant="outline" onClick={() => { }}>Batal</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button variant="destructive" onClick={onConfirm}>Hapus</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}