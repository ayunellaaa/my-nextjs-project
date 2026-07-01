"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export default function StatCard({ title, value, icon: Icon, color, subtitle, badge, tren }: any) {
    return (
        <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    {badge && (
                        <Badge variant="secondary" className="text-xs">
                            {badge}
                        </Badge>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="text-white h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-baseline space-x-2">
                    <div className="text-3xl font-bold text-foreground">
                        {value}
                    </div>
                    {tren && (
                        <div className={`text-sm font-medium ${tren > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tren > 0 ? `+${tren}%` : `${tren}%`}
                        </div>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    )

}