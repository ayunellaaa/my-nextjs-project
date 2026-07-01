"use client";

import React from "react";
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = ["#3b82f6", "#ec4899"];

export default function GenderRatioChart({ data }: { data: any[] }) {
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-green-500" />
                        Jenis Kelamin
                    </CardTitle>
                    <Badge variant="outline">Total Ratio</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%" cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                                `${name} (${percent ? (typeof percent === "number" ? (percent * 100).toFixed(1) : 0) : 0}%)`}
                            outerRadius={100}
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={3}
                            cornerRadius={8}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )

}