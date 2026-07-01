"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import FormFields from "../layout/FormFields";


export default function EditSiswaDialog({
    open,
    setOpen,
    data,
    handleChange,
    handleUpdate,
    dataKelas
}: any) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Siswa</DialogTitle>
                    <DialogDescription>
                        Masukkan data siswa yang ingin di edit.
                    </DialogDescription>
                </DialogHeader>
                <FormFields data={data} onChange={handleChange} kelas={dataKelas} />
                <DialogFooter className="sm:justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <Button className="bg-yellow-500 text-white" onClick={handleUpdate}>Edit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}