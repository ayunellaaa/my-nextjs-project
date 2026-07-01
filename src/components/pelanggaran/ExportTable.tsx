"use client";

import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { Pelanggaran } from "@/types";


interface ExportButtonProps {
    data: Pelanggaran[];
}

export function ExportTable({ data }: ExportButtonProps) {
    const ExportToExcel = () => {
        const worksheetData = XLSX.utils.json_to_sheet(
            data.map((v) => ({
                ID: v.id,
                "Nama Siswa": v.siswa?.nama,
                NIS: v.siswa?.nis,
                kelas: v.siswa?.kelas?.kelas,
                "Jenis Pelanggaran": v.jenis_pelanggaran,
                Tingkat: v.tingkat,
                Poin: v.poin,
                Tanggal: v.tanggal,
                Waktu: v.waktu,
                Lokasi: v.lokasi,
                Deskripsi: v.deskripsi,
                Status: v.status,
                "Dilaporkan Oleh": v.dilaporkan_oleh,
                "Tanggal Tindak Lanjut": v.tanggal_tindak_lanjut,
                Catatan: v.catatan,
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheetData, "Pelanggaran");
        XLSX.writeFile(workbook, `Pelanggaran_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }

    const ExportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Laporan Data Pelanggaran', 14, 16);

        // Perbaikan 1: Ditambahkan koma setelah `doc`
        autoTable(doc, {
            startY: 20,
            head: [["ID", "Nama Siswa", "NIS", "Kelas", "Jenis Pelanggaran", "Tingkat", "Poin", "Tanggal", "Waktu", "Lokasi", "Deskripsi", "Status", "Dilaporkan Oleh", "Tanggal Tindak Lanjut", "Catatan"]],
            // Perbaikan 2: Menggunakan operator `?? ""` untuk menangani nilai null/undefined agar sesuai dengan tipe CellInput[]
            body: data.map((v) => [
                v.id ?? "",
                v.siswa?.nama ?? "",
                v.siswa?.nis ?? "",
                v.siswa?.kelas?.kelas ?? "",
                v.jenis_pelanggaran ?? "",
                v.tingkat ?? "",
                v.poin ?? 0, // Menggunakan angka 0 jika poin kosong
                v.tanggal ?? "",
                v.waktu ?? "",
                v.lokasi ?? "",
                v.deskripsi ?? "",
                v.status ?? "",
                v.dilaporkan_oleh ?? "",
                v.tanggal_tindak_lanjut ?? "",
                v.catatan ?? "",
            ]),
            // Perbaikan 3: Mengubah 'style' menjadi 'styles' & 'fontsize' menjadi 'fontSize'
            styles: { fontSize: 7 },
        });
        doc.save(`Pelanggaran_${new Date().toISOString().slice(0, 10)}.pdf`);
    }
    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={ExportToExcel}
                className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
            >Export Excel
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={ExportToPDF}
                className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
            >
                Export PDF
            </Button>
        </div>
    )
}