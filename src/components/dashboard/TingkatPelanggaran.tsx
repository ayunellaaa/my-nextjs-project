"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Shield } from "lucide-react";

export default function SeverityDistributionList({ data }: { data: any[] }) {
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        Tingkat Pelanggaran
                    </CardTitle>
                    <Badge variant="secondary">Top 5</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((item) => (
                        <div key={item.severity} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="font-medium">{item.severity}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Tambahkan baris ini */}
                                <span className="text-sm text-gray-500">{item.percentage}%</span>
                                <Badge variant="outline">{item.count}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )

}


