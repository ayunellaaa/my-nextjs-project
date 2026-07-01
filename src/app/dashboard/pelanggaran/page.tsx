"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import PelanggaranTable from "@/components/pelanggaran/PelanggaranTable";
import AddPelanggaranDialog from "@/components/pelanggaran/AddPelanggaranDialog";
import EditPelanggaranDialog from "@/components/pelanggaran/EditPelanggaranDialog";
import PelanggaranFilters from "@/components/pelanggaran/FilterTable";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { ExportTable } from "@/components/pelanggaran/ExportTable";
import type { Pelanggaran, Siswa } from "@/types";
import { supabase } from "@/lib/supabase"; // Koneksi langsung ke Supabase Anda

export default function PelanggaranPage() {
    const [violations, setViolations] = useState<Pelanggaran[]>([]);
    const [dataSiswa, setDataSiswa] = useState<Siswa[]>([]);
    const [addDialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingViolation, setEditingViolation] = useState<Pelanggaran | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        status: "",
        severity: "",
        violationType: "",
    });

    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    // 1. Ambil Data dari Supabase (Fix Error: Diurutkan berdasarkan id, bukan created_at)
    const fetchData = async () => {
        setLoading(true);
        try {
            const [siswaResult, pelanggaranResult] = await Promise.all([
                supabase
                    .from("siswa")
                    .select("*, kelas(kelas)"), // Ambil kolom 'kelas' dari tabel 'kelas'
                supabase
                    .from("pelanggaran")
                    .select("*, siswa(nama, nis, kelas(kelas))") // Arahkan ke tabel kelas dengan benar
                    .order("id", { ascending: false })
            ]);

            if (siswaResult.error) throw siswaResult.error;
            if (pelanggaranResult.error) throw pelanggaranResult.error;

            setDataSiswa(siswaResult.data || []);
            setViolations(pelanggaranResult.data || []);
        } catch (error: any) {
            console.error("Error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi Filter & Pencarian Client-side
    const filteredViolations = useMemo(() => {
        return violations.filter((v) => {
            if (filters.startDate && new Date(v.tanggal) < new Date(filters.startDate)) return false;
            if (filters.endDate && new Date(v.tanggal) > new Date(filters.endDate)) return false;

            if (filters.status && v.status !== filters.status) return false;
            if (filters.severity && v.tingkat !== filters.severity) return false;
            if (filters.violationType && v.jenis_pelanggaran !== filters.violationType) return false;

            if (search) {
                const q = search.toLowerCase();
                return (
                    v.siswa?.nama?.toLowerCase().includes(q) ||
                    v.siswa?.nis?.toLowerCase().includes(q) ||
                    v.siswa?.kelas?.kelas?.toLowerCase().includes(q) ||
                    v.jenis_pelanggaran?.toLowerCase().includes(q) ||
                    v.status?.toLowerCase().includes(q) ||
                    v.deskripsi?.toLowerCase().includes(q) ||
                    v.tingkat?.toLowerCase().includes(q)
                )
            }
            return true;
        });
    }, [violations, filters, search]);

    // 2. Simpan Data Baru ke Supabase
    const handleAdd = async (newV: any) => {
        // Bersihkan data sebelum kirim
        const { siswa, id, created_at, updated_at, dilaporkan_oleh, ...dataToInsert } = newV;

        try {
            const { data: inserted, error } = await supabase
                .from("pelanggaran")
                .insert([dataToInsert])
                .select("*, siswa(*, kelas(*))");

            if (error) throw error;

            setViolations((prev) => [inserted[0], ...prev]);
            setDialogOpen(false);
        } catch (error: any) {
            alert(`Gagal: ${error.message}`);
        }
    };

    const handleEdit = (violation: Pelanggaran) => {
        setEditingViolation(violation);
        setEditDialogOpen(true);
    };

    // 3. Update Data ke Supabase
    const handleUpdate = async (updatedV: Pelanggaran) => {
        try {
            // Hapus semua properti yang BUKAN kolom di tabel pelanggaran
            const { siswa, created_at, updated_at, dilaporkan_oleh_user, user_id, pelapor_id, ...payload } = updatedV as any;

            const { data: updated, error } = await supabase
                .from("pelanggaran")
                .update(payload)
                .eq("id", updatedV.id)
                .select("*, siswa(*, kelas(*))"); // Hapus .single() sementara untuk testing

            if (error) throw error;

            // Jika Anda tetap ingin menggunakan .single(), pastikan data ada
            const result = updated && updated.length > 0 ? updated[0] : null;

            setViolations((prev) =>
                prev.map((v) => (v.id === updatedV.id ? (result || updatedV) : v))
            );
            setEditDialogOpen(false);
            alert("Berhasil!");
        } catch (error: any) {
            console.error("Update error:", error);
            alert(`Gagal: ${error.message}`);
        }
    };

    // 4. Hapus Data dari Supabase
    const handleDelete = async (id: number) => { // Pastikan tipe data 'id' sesuai dengan database Anda
        if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

        try {
            const { error } = await supabase
                .from("pelanggaran")
                .delete()
                .eq("id", id); // Pastikan nama kolom di tabel adalah 'id'

            if (error) throw error;

            // Update state agar baris hilang dari tampilan tanpa refresh
            setViolations((prev) => prev.filter((v) => v.id !== id));
            alert("Berhasil Menghapus Data Pelanggaran!");
        } catch (error: any) {
            console.error("Error menghapus pelanggaran:", error.message);
            alert(`Gagal menghapus data: ${error.message}`);
        }
    };

    const clearFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
            status: "",
            severity: "",
            violationType: "",
        });
        setSearch("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg animate-pulse">Memuat data ...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Data Pelanggaran</h1>
            <ExportTable data={filteredViolations} />

            <Card className="p-4 shadow">
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="flex flex-1 items-center gap-2">
                            <Input
                                placeholder="Cari ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 text-sm w-full sm:w-[300px]"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                            {showFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-red-600 border-red-50"
                                >
                                    <X className="h-4 w-4" />Reset
                                </Button>
                            )}
                        </div>
                        <Select value={pageSize.toString()} onValueChange={v => setPageSize(Number(v))}>
                            <SelectTrigger className="w-20 h-9 text-sm">
                                <SelectValue placeholder="Jumlah" />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100].map(n => (
                                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <AddPelanggaranDialog
                            open={addDialogOpen}
                            onOpenChange={setDialogOpen}
                            onAdd={handleAdd}
                            dataSiswa={dataSiswa}
                            siswaList={dataSiswa}
                        />
                    </div>

                    {showFilters && (
                        <PelanggaranFilters
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            search={search}
                            setSearch={setSearch}
                            filters={filters as any}
                            onFilterChange={(key, value) => {
                                setFilters(prev => ({ ...prev, [key]: value }))
                            }}
                            onClearFilters={clearFilters}
                            filterOptions={{
                                types: [...new Set(violations.map(v => v.jenis_pelanggaran))],
                                severities: ['Ringan', 'Sedang', 'Berat'],
                                statuses: ['Aktif', 'Selesai']
                            }}
                            filteredCount={filteredViolations.length}
                            totalCount={violations.length}
                        />
                    )}

                    <PelanggaranTable
                        violations={filteredViolations}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        pageSize={pageSize}
                    />
                </div>
            </Card >

            {editingViolation && (
                <EditPelanggaranDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    onUpdate={handleUpdate}
                    violation={editingViolation}
                />
            )}
        </div >
    )
}