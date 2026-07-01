"use client";

import React, { useState, useEffect } from "react";
import { Users, GraduationCap, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import StatCard from "@/components/dashboard/StatCard";
import SiswaChart from "@/components/dashboard/SiswaChart";
import GenderRatioChart from "@/components/dashboard/GenderRatioChart";
import TrenPelanggaran from "@/components/dashboard/TrenPelanggaran";
import TipePelanggaran from "@/components/dashboard/TipePelanggaran";
import SeverityDistributionList from "@/components/dashboard/TingkatPelanggaran";
import TopViolatorList from "@/components/dashboard/TopPelanggaran";
import BirthYearDistribution from "@/components/dashboard/BirthYearDistribution";

import { DataTahunLahir, DataBar, DataPie, ViolationStats } from "@/types";
import { supabase } from "@/lib/supabase";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
    badge?: string;
}

export default function DashboardPage() {
    const [totalSiswa, setTotalSiswa] = useState(0);
    const [totalKelas, setTotalKelas] = useState(0);
    const [barData, setBarData] = useState<DataBar[]>([]);
    const [pieData, setPieData] = useState<DataPie[]>([]);
    const [violationStats, setViolationStats] = useState<ViolationStats>({
        totalViolations: 0,
        monthlyViolations: [],
        violationTypes: [],
        severityDistribution: [],
        topViolators: [],
    });
    const [birthYearData, setBirthYearData] = useState<DataTahunLahir[]>([]);

    useEffect(() => {
        // Ganti bagian fetchData di page.tsx menjadi:
        const fetchData = async () => {
            try {
                const res = await fetch("api/dashboard");
                const data = await res.json();

                if (data.error) throw new Error(data.error);

                setTotalSiswa(data.totalSiswa || 0);
                setTotalKelas(data.totalKelas || 0);

                // PERBAIKAN: Gunakan data.bar_data sesuai dengan yang dikirim di route.ts
                // Dan lakukan mapping agar key-nya cocok dengan SiswaChart.tsx
                const formattedBarData = (data.bar_data || []).map((item: any) => ({
                    nama_kelas: item.nama_kelas, // dari route.ts
                    "Laki-Laki": item['Laki-Laki'],        // dari route.ts
                    "Perempuan": item['Perempuan']         // dari route.ts
                }));
                setBarData(formattedBarData);

                setPieData(data.pie_data || []); // Pastikan juga menggunakan pie_data (underscore)

                setViolationStats({
                    totalViolations: data.totalPelanggaran || 0,
                    monthlyViolations: (data.pelanggaranTren || []).map((item: any) => ({
                        bulan: item.bulan,
                        Aktif: item.Aktif,
                        Selesai: item.Selesai,
                    })),
                    violationTypes: (data.pelanggaranPerJenis || []).map((item: any) => ({
                        type: item.jenis_pelanggaran,
                        count: item.total,
                        percentage: parseFloat(
                            (((item.total || 0 / (data.totalPelanggaran || 1)) * 100).toFixed(1))
                        )
                    })),
                    severityDistribution: (data.pelanggaranPerTingkat || []).map((item: any) => ({
                        severity: item.tingkat,
                        count: item.total,
                        // Perhitungan persentase dengan pembulatan 1 digit desimal
                        percentage: parseFloat(
                            (((item.total || 0) / (data.totalPelanggaran || 1)) * 100).toFixed(1)
                        ),
                        color: item.tingkat === "Ringan" ? "#22c55e" :
                            item.tingkat === "Sedang" ? "#3b82f6" : "#ef4444",
                    })),

                    topViolators: (data.pelanggaranPerKelas || []).map((item: any) => ({
                        name: item.kelas,
                        violations: item.total,
                    })),
                });
                setBirthYearData(data.bar_data_birthYear || []);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };

        fetchData();
    }, []);

    console.log("Data yang dikirim ke SiswaChart:", barData);
    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto spaye-y-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Dashboard Siswa</h1>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Siswa" value={totalSiswa} icon={Users} color="bg-blue-500" subtitle="Siswa Aktif" badge="Aktif" />
                    <StatCard title="Kelas" value={totalKelas} icon={GraduationCap} color="bg-green-500" subtitle="Kelas" />
                    <StatCard title="Rata-Rata Kelas" value={totalKelas ? Math.round(totalSiswa / totalKelas) : 0} icon={TrendingUp} color="bg-amber-500" subtitle="Siswa per Kelas" />
                    <StatCard title="Pelanggaran" value={violationStats.totalViolations} icon={AlertTriangle} color="bg-red-500" subtitle="Total Pelanggaran" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
                    <SiswaChart data={barData} />
                    <GenderRatioChart data={pieData} />
                    <TrenPelanggaran data={violationStats.monthlyViolations} />
                    <TipePelanggaran data={violationStats.violationTypes} total={violationStats.totalViolations} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-5">
                    <SeverityDistributionList data={violationStats.severityDistribution} />
                    <TopViolatorList data={violationStats.topViolators} />
                    <BirthYearDistribution data={birthYearData} />
                </div>
            </div>
        </div>
    );
}