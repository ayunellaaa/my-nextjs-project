"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";


export default function AddKelasDialog({
    open,
    setOpen,
    form,
    handleChange,
    handleUpdate,
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    form: { kelas: string },
    handleChange: (key: string, value: string) => void,
    handleUpdate: () => void,
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-full max-w-[min(90vw, 300px)] max-h-[calc(100vh-10rem)] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Kelas</DialogTitle>
                    <DialogDescription>
                        Edit data kelas.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-2">
                    <Label htmlFor="kelas">Nama Kelas</Label>
                    <Input
                        id="kelas"
                        value={form.kelas}
                        onChange={(e) => handleChange('kelas', e.target.value)}
                        placeholder="Masukkan Nama Kelas"
                    />
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <Button className="bg-blue-500 text-white" onClick={handleUpdate}>Tambah</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
