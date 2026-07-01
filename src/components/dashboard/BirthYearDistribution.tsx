"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar } from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];

export default function BirthYearDistribution({ data }: { data: any[] }) {
    const sortedData = [...data].sort((a, b) => b.count - a.count);
    const totalData = data.reduce((sum, item) => sum + item.count, 0);
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Distribusi Tahun Kelahiran Siswa
                    </CardTitle>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                        {sortedData.length} Tahun Kelahiran
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex justify-center">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(255,255,255, 0.95)",
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                                    }}
                                    formatter={(value, name, props) =>
                                        [`${value as number} siswa`, `Tahun ${(props.payload as any).year}`]}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}