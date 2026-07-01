"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { BarChart3 } from "lucide-react";

export default function SiswaChart({ data }: { data: any[] }) {
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Siswa per Kelas
                    </CardTitle>
                    <Badge variant="outline">Gender Distribution</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="nama_kelas" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(255,255,255, 0.95)",
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                            }}
                        />
                        <Legend />
                        <Bar dataKey="Laki-Laki" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Perempuan" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}