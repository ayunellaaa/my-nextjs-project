"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // useParams untuk mengambil ID dari URL
import { Button } from "@/components/ui/button";
import { Check, Download, ArrowLeft, Loader2 } from "lucide-react"; // Menambahkan Loader2
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Pelanggaran, EvidenceItem } from "@/types";
import InfoSiswa from "@/components/pelanggaran/details/InfoSiswa";
import BuktiPelanggaran from "@/components/pelanggaran/details/BuktiPelanggaran";
import TindakanDiambil from "@/components/pelanggaran/details/TindakanDiambil";
import { supabase } from "@/lib/supabase"; // Pastikan path ini benar

export default function DetailPelanggaranPage() {
    const router = useRouter();
    const params = useParams(); // Mengambil ID dari URL (asumsi rute /pelanggaran/[id])
    const id = params.id as string;

    const [violation, setViolation] = useState<Pelanggaran | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({ action: "", note: "", followUp: "" });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Mengambil data real dari Supabase
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("pelanggaran")
                .select("*, siswa(*, kelas(*))")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching data:", error);
            } else {
                setViolation(data);
                // Inisialisasi formData dengan data yang ada
                setFormData({
                    action: data.tindakan || "",
                    note: data.catatan || "",
                    followUp: data.tanggal_tindak_lanjut || ""
                });
            }
            setLoading(false);
        };

        fetchData();
    }, [id]);

    const evidence: EvidenceItem[] = violation?.url ? [{
        id: 1,
        pelanggaran_id: violation?.id,
        tipe: "image",
        url: violation.url,
        deskripsi: "Foto Bukti Pelanggaran",
        nama: "Bukti_pelanggaran.jpg",
        diunggah_oleh: violation.dilaporkan_oleh_user?.name || "Pak Anto",
        waktu_unggah: violation.created_at,
        pelanggaran: violation
    }] : [];

    const getServerityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case "ringan": return "bg-green-100 text-green-800";
            case "sedang": return "bg-yellow-100 text-yellow-800";
            case "berat": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "aktif": return "bg-orange-100 text-orange-800";
            case "selesai": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleActionSubmit = async () => {
        if (!violation) return;
        const { error } = await supabase
            .from("pelanggaran")
            .update({
                tindakan: formData.action,
                catatan: formData.note,
                tanggal_tindak_lanjut: formData.followUp
            })
            .eq("id", id);

        if (!error) {
            setViolation({ ...violation, tindakan: formData.action, catatan: formData.note, tanggal_tindak_lanjut: formData.followUp });
            setIsEditModalOpen(false);
            alert('Tindakan berhasil disimpan');
        }
    };

    const handleMarkAsComplete = async () => {
        if (!violation) return;
        const { error } = await supabase
            .from("pelanggaran")
            .update({ status: "Selesai" })
            .eq("id", id);

        if (!error) {
            setViolation({ ...violation, status: "Selesai" });
            alert('Status diupdate');
        }
    };

    const handleDownloadReport = () => { /* Logika PDF anda */ };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    if (!violation) return <div className="p-10 text-center">Data tidak ditemukan.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.back()} className="flex items-center justify-center px-2 py-2 border border-gray-200 rounded-lg hover:bg-transparent">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                        </Button>
                        <div className="text-sm text-gray-500">
                            Dashboard / <span className="font-semibold text-gray-900">Detail Pelanggaran</span>
                        </div>
                    </div>
                </div>

                <InfoSiswa data={violation} getSeverityColor={getServerityColor} getStatusColor={getStatusColor} />

                <BuktiPelanggaran
                    bukti={evidence}
                    onLihat={(url) => setSelectedImage(typeof url === 'string' ? url : url.url)}
                />

                <TindakanDiambil
                    actionTaken={violation.tindakan}
                    followUpdate={violation.tanggal_tindak_lanjut}
                    notes={violation.catatan}
                    isEditModalOpen={isEditModalOpen}
                    setIsEditModalOpen={setIsEditModalOpen}
                    formData={formData}
                    handleInputChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                    handleActionSubmit={handleActionSubmit}
                />

                <div className="space-y-3 pt-4">
                    <Button onClick={handleDownloadReport} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" /> Download Laporan (PDF)
                    </Button>
                    {violation.status !== "Selesai" && (
                        <Button onClick={handleMarkAsComplete} className="w-full bg-green-600 hover:bg-green-700">
                            <Check className="w-4 h-4 mr-2" /> Tandai sebagai Selesai
                        </Button>
                    )}
                </div>
            </div>

            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Bukti Pelanggaran" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" />
                </div>
            )}
        </div>
    );
}