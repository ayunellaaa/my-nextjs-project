"use client";

// 1. PASTIKAN TAMBAHKAN useEffect DI SINI
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Pelanggaran, Siswa } from "@/types";
import { FormFieldsPelanggaran, PelanggaranFormData } from "@/components/pelanggaran/FormFieldsPelanggaran";
import { supabase } from "@/lib/supabase";

interface AddPelanggaranDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    siswaList: Siswa[];
    onAdd: (violation: Omit<Pelanggaran, 'id' | 'created_at' | 'updated_at' | 'siswa' | 'dilaporkan_oleh_user'>) => Promise<void>;
    dataSiswa: Siswa[];
}

export interface MasterPelanggaran {
    id: number;
    nama_pelanggaran: string;
    tingkat: string;
    poin_standar: number;
}

const getInitialForm = (): PelanggaranFormData => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].slice(0, 5);
    return {
        siswa_id: 0,
        jenis_pelanggaran: "",
        tingkat: "",
        poin: 0,
        tanggal: today,
        waktu: now,
        lokasi: "",
        deskripsi: "",
        status: "Aktif",
        tindakan: null,
        tanggal_tindak_lanjut: null,
        catatan: null,
        url: null,
    };
};

export default function AddPelanggaranDialog({
    open,
    onOpenChange,
    onAdd,
    dataSiswa,
}: AddPelanggaranDialogProps) {
    const [form, setForm] = useState<PelanggaranFormData>(getInitialForm());
    // 2. TAMBAHKAN STATE UNTUK MENAMPUNG MASTER DATA
    const [masterPelanggaranList, setMasterPelanggaranList] = useState<MasterPelanggaran[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // 3. TAMBAHKAN LOGIKA FETCH DATA SUPABASE DI SINI
    useEffect(() => {
        const fetchMasterPelanggaran = async () => {
            try {
                const { data, error } = await supabase
                    .from("master_pelanggaran")
                    .select("id, nama_pelanggaran, tingkat, poin_standar")
                    .order("nama_pelanggaran", { ascending: true });

                if (error) throw error;
                setMasterPelanggaranList(data || []);
            } catch (error) {
                console.error("Gagal mengambil data master pelanggaran:", error);
            }
        };

        if (open) {
            fetchMasterPelanggaran();
        }
    }, [open]);

    const handleFormChange = <K extends keyof PelanggaranFormData>(key: K, value: PelanggaranFormData[K]) => {
        setForm(prev => {
            const newForm = {
                ...prev,
                [key]: value
            };

            // 4. OTOMATISASI PENGISIAN TINGKAT & POIN JIKA JENIS PELANGGARAN DIUBAH
            if (key === 'jenis_pelanggaran') {
                const selectedMaster = masterPelanggaranList.find(
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

    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl("");
        setForm(prev => ({
            ...prev,
            url: null
        }));
    };

    const resetForm = () => {
        setForm(getInitialForm());
        setSelectedFile(null);
        setPreviewUrl("");
        setSearchQuery("");
    };

    const handleSubmit = async () => {
        if (!form.siswa_id || form.siswa_id === 0) {
            alert("Silahkan pilih siswa");
            return;
        }

        if (!form.jenis_pelanggaran.trim()) {
            alert("Silahkan isi jenis pelanggaran");
            return;
        }
        if (!form.tingkat) {
            alert("Silahkan pilih tingkat pelanggaran");
            return;
        }

        try {
            setUploading(true);
            let uploadedUrl = form.url;

            if (selectedFile) {
                const fileExt = "png";
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `fotopelanggaran/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('fotopelanggaran')
                    .upload(filePath, selectedFile);

                if (uploadError) {
                    throw new Error('Gagal mengupload foto kamera ke storage: ' + uploadError.message);
                }

                const { data } = supabase.storage
                    .from('fotopelanggaran')
                    .getPublicUrl(filePath);

                uploadedUrl = data.publicUrl;
            }
            const cleanData = {
                siswa_id: form.siswa_id,
                dilaporkan_oleh: 1,
                jenis_pelanggaran: form.jenis_pelanggaran.trim(),
                tingkat: form.tingkat,
                poin: form.poin,
                tanggal: form.tanggal,
                waktu: form.waktu,
                lokasi: form.lokasi,
                deskripsi: form.deskripsi,
                status: form.status,
                tindakan: form.tindakan?.trim() || null,
                tanggal_tindak_lanjut: form.tanggal_tindak_lanjut?.trim() || null,
                catatan: form.catatan?.trim() || null,
                url: uploadedUrl || null,
            };

            await onAdd(cleanData);
            resetForm();
            onOpenChange(false);
        }
        catch (error) {
            console.error('Error submitting form:', error);
            alert('Gagal menambahkan data');
        }
        finally {
            setUploading(false);
        }
    };

    const handleCameraCapture = (base64Image: string) => {
        setPreviewUrl(base64Image);

        fetch(base64Image)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `camera_${Date.now()}.png`, { type: "image/png" });
                setSelectedFile(file);
            });
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen);
            if (!isOpen) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    + Tambah Pelanggaran
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Tambah Pelanggaran</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <FormFieldsPelanggaran
                        form={form}
                        dataSiswa={dataSiswa}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onChange={handleFormChange}
                        previewUrl={previewUrl || undefined}
                        onRemoveFile={removeFile}
                        onCameraCapture={handleCameraCapture}
                        masterPelanggaranList={masterPelanggaranList} // 5. WAJIB DIKIRIMKAN KE FORM ANAK
                    />
                </div>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" onClick={resetForm} disabled={uploading}>
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
                            "Simpan"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}