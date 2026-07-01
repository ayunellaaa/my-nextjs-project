"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Activity, BarChart3 } from "lucide-react";

export default function TrenPelanggaran({ data }: { data: any[] }) {
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-500" />
                        Tren Pelanggaran
                    </CardTitle>
                    <Badge variant="outline">6 bulan terakhir</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="bulan" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Aktif" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Pelanggaran" />
                        <Area type="monotone" dataKey="Selesai" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Diselesaikan" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}