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

interface EditPelanggaranDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    violation: Pelanggaran;
    onUpdate: (violation: Pelanggaran) => void;
}

export default function EditPelanggaranDialog({
    open,
    onOpenChange,
    violation,
    onUpdate,
}: EditPelanggaranDialogProps) {
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

    // State tambahan untuk mengelola file jepretan kamera baru dan loading status
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

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
            // Set preview awal jika data pelanggaran lama memang sudah punya foto
            setPreviewUrl(violation.url || null);
        }
    }, [violation]);

    const handleChange = <K extends keyof PelanggaranFormData>(key: K, value: PelanggaranFormData[K]) => {
        setForm(prev => ({
            ...prev,
            [key]: value,
        }));
    }

    // Fungsi untuk menghapus foto (mengembalikan ke tampilan awal kosong)
    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setForm(prev => ({
            ...prev,
            url: null
        }));
    };

    // Fungsi untuk menangkap base64 dari kamera dan mengubahnya menjadi File objek untuk diupload
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

            // Jika ada jepretan kamera baru yang tersimpan di selectedFile, upload ke Supabase Storage
            if (selectedFile) {
                const fileExt = "png";
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `fotopelanggaran/${fileName}`;

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

            // Kirim pembaruan data ke fungsi onUpdate milik parent component
            onUpdate({
                ...violation,
                ...form,
                poin: Number(form.poin) || 0,
                url: uploadedUrl, // Memastikan URL foto terbaru (atau null jika dihapus) ikut tersimpan
            });

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
                    <FormFieldsPelanggaran
                        form={form}
                        onChange={handleChange}
                        showSiswaFields={false}
                        showOptionalFields={true}
                        previewUrl={previewUrl || undefined}
                        onRemoveFile={removeFile}
                        onCameraCapture={handleCameraCapture}
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
    )
}