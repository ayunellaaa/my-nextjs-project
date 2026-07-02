"use client";

import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash, ChevronLeft, ChevronRight, Image } from "lucide-react";
import ConfirmDeleteDialog from "@/components/layout/DeleteDialog";
import Link from "next/link";
import { Pelanggaran } from "@/types";
import { supabase } from "@/lib/supabase";

interface PelanggaranTableProps {
    violations: Pelanggaran[];
    onEdit: (violations: Pelanggaran) => void;
    onDelete: (id: number) => void;
    pageSize: number;
}

const getStoragePathFromUrl = (url: string) => {
    try {
        const parts = url.split('/fotopelanggaran/');
        if (parts.length > 1) {
            return parts[parts.length - 1];
        }
        return null;
    } catch (e) {
        console.error("Gagal mengekstrak path storage:", e);
        return null;
    }
};

export default function PelanggaranTable({ violations, onEdit, onDelete, pageSize }: PelanggaranTableProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // State lokal untuk menampung data agar bisa diperbarui secara real-time saat ada perubahan di database
    const [localViolations, setLocalViolations] = useState<Pelanggaran[]>(violations);

    // Sinkronisasi jika prop 'violations' dari parent component berubah
    useEffect(() => {
        setLocalViolations(violations);
    }, [violations]);

    // --- FITUR REAL-TIME SUPABASE ---
    useEffect(() => {
        // Berlangganan (Subscribe) terhadap perubahan tabel pelanggaran di database
        const channel = supabase
            .channel("realtime-table-pelanggaran")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "pelanggaran" },
                (payload) => {
                    // Jika admin menghapus file di bucket dan memicu trigger kolom url menjadi NULL
                    setLocalViolations((prevList) =>
                        prevList.map((item) =>
                            item.id === payload.new.id
                                ? { ...item, url: payload.new.url } // Update url secara instan (menjadi null)
                                : item
                        )
                    );
                }
            )
            .subscribe();

        // Putus koneksi real-time saat komponen tidak digunakan lagi
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredViolations = useMemo(() => {
        if (!search) return localViolations;
        const q = search.toLowerCase();
        return localViolations.filter((v) =>
            v.siswa?.nama?.toLowerCase().includes(q) ||
            v.siswa?.nis?.toLowerCase().includes(q) ||
            v.siswa?.kelas?.kelas?.toLowerCase().includes(q) ||
            v.jenis_pelanggaran?.toLowerCase().includes(q) ||
            v.deskripsi?.toLowerCase().includes(q) ||
            v.status?.toLowerCase().includes(q) ||
            v.tingkat?.toLowerCase().includes(q)
        );
    }, [localViolations, search]);

    const totalPages = Math.max(1, Math.ceil(filteredViolations.length / pageSize));
    const paginatedData = filteredViolations.slice((page - 1) * pageSize, page * pageSize);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "Ringan": return "bg-green-100 text-green-800";
            case "Sedang": return "bg-yellow-100 text-yellow-800";
            case "Berat": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    }

    const getStatusColor = (status: string) => {
        const lower = status.toLowerCase();
        if (lower === "selesai") return "bg-green-100 text-green-800 border-green-200";
        if (lower === "pending") return "bg-yellow-100 text-yellow-800 border-yellow-200";
        return "bg-red-100 text-red-800 border-red-200";
    }

    const handleDeleteClick = (id: number) => {
        setSelectedId(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedId === null) return;

        try {
            // 2. Cari data pelanggaran yang ingin dihapus berdasarkan selectedId
            const violationToDelete = localViolations.find(v => v.id === selectedId);

            // 3. Jika data ditemukan dan memiliki foto di storage, hapus fotonya dulu
            if (violationToDelete && violationToDelete.url) {
                const filePath = getStoragePathFromUrl(violationToDelete.url);
                if (filePath) {
                    const { error: storageError } = await supabase.storage
                        .from('fotopelanggaran')
                        .remove([filePath]);

                    if (storageError) {
                        console.error("Gagal menghapus file dari storage:", storageError.message);
                    } else {
                        console.log("Foto lama berhasil dibersihkan dari storage Supabase");
                    }
                }
            }

            // 4. Proses hapus baris data dari database (Kode bawaan kamu)
            const { error } = await supabase
                .from("pelanggaran")
                .delete()
                .eq("id", selectedId);

            if (error) throw error;

            // 5. Update state lokal & panggil callback parent (Kode bawaan kamu)
            setLocalViolations((prev) => prev.filter((v) => v.id !== selectedId));
            onDelete(selectedId);
            setDeleteDialogOpen(false);
            setSelectedId(null);

        } catch (error: any) {
            console.error("Error deleting violation:", error.message);
            alert("Gagal menghapus data pelanggaran.");
        }
    };

    return (
        <div className="space-y-4">
            {/* Input Search untuk mempermudah filter */}
            <div className="flex items-center justify-between gap-4">
                <input
                    type="text"
                    placeholder="Cari pelanggaran..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1); // Reset ke halaman pertama saat mencari
                    }}
                    className="border p-2 rounded text-sm w-full max-w-sm focus:outline-blue-500"
                />
            </div>

            <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-2 text-left">No</th>
                            <th className="px-4 py-2 text-left">Nama Siswa</th>
                            <th className="px-4 py-2 text-left">Nis</th>
                            <th className="px-4 py-2 text-left">Kelas</th>
                            <th className="px-4 py-2 text-left">Jenis Pelanggaran</th>
                            <th className="px-4 py-2 text-left">Tingkat</th>
                            <th className="px-4 py-2 text-left">Poin</th>
                            <th className="px-4 py-2 text-left">Tanggal</th>
                            <th className="px-4 py-2 text-center">Foto</th>
                            <th className="px-4 py-2 text-center">Status</th>
                            <th className="px-4 py-2 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((v, idx) => (
                                <tr key={v.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2 text-center">{(page - 1) * pageSize + idx + 1}</td>
                                    <td className="p-2">{v.siswa?.nama ?? "-"}</td>
                                    <td className="p-2 text-center">{v.siswa?.nis ?? "-"}</td>
                                    <td className="p-2 text-center">{v.siswa?.kelas?.kelas ?? "-"}</td>
                                    <td className="p-2">{v.jenis_pelanggaran ?? "-"}</td>
                                    <td className="p-2">
                                        <Badge className={getSeverityColor(v.tingkat ?? "")}>{v.tingkat ?? "-"}</Badge>
                                    </td>
                                    <td className="p-2 text-center">{v.poin ?? "-"}</td>
                                    <td className="p-2 text-center">{v.tanggal ?? "-"}</td>
                                    <td className="p-2 text-center">
                                        {/* KONDISI OTOMATIS: Jika v.url real-time berubah menjadi null, tampilan ikon biru ini otomatis langsung hilang */}
                                        {v.url ? (
                                            <div className="flex justify-center" title="Ada foto bukti">
                                                <Image className="text-blue-600 h-4 w-4" />
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="p-2 text-center">
                                        <Badge className={getStatusColor(v.status ?? '')}>{v.status ?? '-'}</Badge>
                                    </td>
                                    <td className="p-2 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/pelanggaran/${v.id}`} className="flex items-center gap-2">
                                                        <Eye className="h-4 w-4" />Detail
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(v)} className="flex items-center gap-2">
                                                    <Pencil className="h-4 w-4" />Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(v.id!)} className="flex items-center gap-2 text-red-600 focus:text-red-600">
                                                    <Trash className="h-4 w-4" />Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={11} className="p-4 text-center text-gray-500">Tidak ada data</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                    <div>
                        Halaman {page} dari {totalPages}
                        <div className="flex items-center gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <ConfirmDeleteDialog onConfirm={handleConfirmDelete} />
            </Dialog>
        </div>
    );
}