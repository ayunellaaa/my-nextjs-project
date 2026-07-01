"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import FormFields from "../layout/FormFields";
import { Kelas } from "@/types";


export default function AddSiswaDialog({
    open,
    setOpen,
    data,
    handleChange,
    handleAdd,
    dataKelas
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    data: any,
    handleChange: (key: string, value: string | number) => void,
    handleAdd: () => void,
    dataKelas: Kelas[];
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-500 text-white">Tambah Siswa</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-lg">
                <DialogHeader>
                    <DialogTitle>Tambah Siswa</DialogTitle>
                    <DialogDescription>
                        Masukkan data siswa baru.
                    </DialogDescription>
                </DialogHeader>
                <FormFields data={data} onChange={handleChange} kelas={dataKelas} />
                <DialogFooter className="sm:justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <Button className="bg-blue-500 text-white" onClick={handleAdd}>Tambah</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}