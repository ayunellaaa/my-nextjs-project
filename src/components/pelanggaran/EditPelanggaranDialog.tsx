"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Pelanggaran } from "@/types";
import { FormFieldsPelanggaran, PelanggaranFormData } from "@/components/pelanggaran/FormFieldsPelanggaran";
import { supabase } from "@/lib/supabase";
import { MasterPelanggaran } from "./AddPelanggaranDialog";

interface EditPelanggaranDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    violation: Pelanggaran;
    onUpdate: (violation: Pelanggaran) => void;
}

// Fungsi untuk mengambil path file dari URL public Supabase
const getStoragePathFromUrl = (url: string) => {
    try {
        // Memotong URL untuk mendapatkan part setelah nama bucket '/fotopelanggaran/'
        const parts = url.split('/fotopelanggaran/');
        if (parts.length > 1) {
            return parts[parts.length - 1];
        }
        return null;
    } catch (e) {
        console.error("Gagal ekstrak storage path:", e);
        return null;
    }
};

export default function EditPelanggaranDialog({
    open,
    onOpenChange,
    violation,
    onUpdate,
}: EditPelanggaranDialogProps) {

    const [MasterPelanggaranList, setMasterPelanggaranList] = useState<MasterPelanggaran[]>([]);
    const [form, setForm] = useState<PelanggaranFormData>({
        siswa_id: 0,
        jenis_pelanggaran: '',
        tingkat: '',
        poin: 0,
        tanggal: '',
        waktu: '',
        lokasi: '',
        deskripsi: '',
        status: 'Aktif',
        tindakan: null,
        tanggal_tindak_lanjut: null,
        catatan: null,
        url: null,
    });

    // Ambil data master pelanggaran saat dialog dibuka
    useEffect(() => {
        async function fetchMasterPelanggaran() {
            try {
                const { data, error } = await supabase
                    .from('master_pelanggaran')
                    .select('*');

                if (error) throw error;
                if (data) setMasterPelanggaranList(data);
            } catch (error) {
                console.error('Error fetching master_pelanggaran:', error);
            }
        }

        if (open) {
            fetchMasterPelanggaran();
        }
    }, [open]);

    // State tambahan untuk mengelola file jepretan kamera baru dan loading status
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Sinkronisasi data pelanggaran yang mau diedit ke dalam form
    useEffect(() => {
        if (violation) {
            setForm({
                siswa_id: violation.siswa_id,
                jenis_pelanggaran: violation.jenis_pelanggaran,
                tingkat: violation.tingkat,
                poin: violation.poin,
                tanggal: violation.tanggal,
                waktu: violation.waktu,
                lokasi: violation.lokasi,
                deskripsi: violation.deskripsi,
                status: violation.status,
                tindakan: violation.tindakan || null,
                tanggal_tindak_lanjut: violation.tanggal_tindak_lanjut || null,
                catatan: violation.catatan || null,
                url: violation.url || null,
            });
            setPreviewUrl(violation.url || null);
        }
    }, [violation]);

    const handleChange = <K extends keyof PelanggaranFormData>(key: K, value: PelanggaranFormData[K]) => {
        setForm(prev => {
            const newForm = { ...prev, [key]: value };

            // Otomatisasi tingkat & poin jika jenis_pelanggaran diubah di mode edit
            if (key === 'jenis_pelanggaran') {
                const selectedMaster = MasterPelanggaranList.find(
                    item => item.nama_pelanggaran === value
                );
                if (selectedMaster) {
                    newForm.tingkat = selectedMaster.tingkat;
                    newForm.poin = selectedMaster.poin_standar;
                } else {
                    newForm.tingkat = "";
                    newForm.poin = 0;
                }
            }
            return newForm;
        });
    };

    const removeFile = async () => {
        // Jika ada URL foto lama di database/form, hapus dari storage Supabase
        if (form.url) {
            const filePath = getStoragePathFromUrl(form.url);
            if (filePath) {
                try {
                    const { error: deleteError } = await supabase.storage
                        .from('fotopelanggaran')
                        .remove([filePath]);

                    if (deleteError) {
                        console.error("Gagal menghapus file dari storage:", deleteError.message);
                    } else {
                        console.log("File lama berhasil dihapus dari storage");
                    }
                } catch (err) {
                    console.error("Error saat menghapus file:", err);
                }
            }
        }

        // Reset state di aplikasi
        setSelectedFile(null);
        setPreviewUrl(null);
        setForm(prev => ({ ...prev, url: null }));
    };

    const handleCameraCapture = (base64Image: string) => {
        setPreviewUrl(base64Image);
        fetch(base64Image)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `camera_edit_${Date.now()}.png`, { type: "image/png" });
                setSelectedFile(file);
            });
    };

    const handleSubmit = async () => {
    if (!violation) return;

    try {
        setUploading(true);
        let uploadedUrl = form.url;
        let oldPhotoPathToDelete = null;

        // Jika user mengambil foto baru
        if (selectedFile) {
            // 1. Catat path foto lama jika sebelumnya sudah ada foto di database
            if (violation.url) {
                oldPhotoPathToDelete = getStoragePathFromUrl(violation.url);
            }

            const fileExt = "png";
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `fotopelanggaran/${fileName}`;

            // 2. Upload foto baru
            const { error: uploadError } = await supabase.storage
                .from('fotopelanggaran')
                .upload(filePath, selectedFile);

            if (uploadError) {
                throw new Error('Gagal mengupload foto kamera baru: ' + uploadError.message);
            }

            const { data } = supabase.storage
                .from('fotopelanggaran')
                .getPublicUrl(filePath);

            uploadedUrl = data.publicUrl;
        }

        // 3. Update data pelanggaran di database
        onUpdate({
            ...violation,
            ...form,
            poin: Number(form.poin) || 0,
            url: uploadedUrl,
        });

        // 4. SETELAH DATABASE SUKSES UPDATE, Hapus foto lama dari storage jika ada penggantian
        if (oldPhotoPathToDelete) {
            await supabase.storage
                .from('fotopelanggaran')
                .remove([oldPhotoPathToDelete]);
            console.log("Foto lama yang digantikan berhasil dibersihkan dari storage");
        }

        setSelectedFile(null);
        onOpenChange(false);
    } catch (error) {
        console.error('Error updating violation:', error);
        alert('Gagal memperbarui data dan mengunggah foto.');
    } finally {
        setUploading(false);
    }
};

    if (!violation) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen);
            if (!isOpen) {
                setSelectedFile(null);
            }
        }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Edit Data Pelanggaran</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* SEKARANG PROPS DATANYA SUDAH DIOPER DENGAN BENAR DI SINI */}
                    <FormFieldsPelanggaran
                        form={form}
                        onChange={handleChange}
                        showSiswaFields={false}
                        showOptionalFields={true}
                        previewUrl={previewUrl || undefined}
                        onRemoveFile={removeFile}
                        onCameraCapture={handleCameraCapture}
                        masterPelanggaranList={MasterPelanggaranList}
                    />
                </div>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={uploading}>
                            Batal
                        </Button>
                    </DialogClose>

                    <Button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Perubahan"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}