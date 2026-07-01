"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface FilterOption {
    types: string[];
    severities: string[];
    statuses: string[];
}

interface Filters {
    search: string;
    type: string;
    severity: string;
    status: string;
}

interface FilterTableProps {
    startDate: string;
    endDate: string;
    status: string;
    severity: string;
    violationType: string;
}

interface PelanggaranFiltersProps {
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    search: string;
    setSearch: (search: string) => void;
    filters: Filters;
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
    filterOptions: FilterOption;
    filteredCount: number;
    totalCount: number;
}

export default function PelanggaranFilters({
    showFilters,
    setShowFilters,
    search,
    setSearch,
    filters,
    onFilterChange,
    onClearFilters,
    filterOptions,
    filteredCount,
    totalCount,
}: PelanggaranFiltersProps) {
    return (
        <div className="space-y-4">
            {/*Header*/}
            <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex flex-1 items-center gap-2">
                    <div className="text-xs text-gray-600 ml-2">
                        <span className="font-medium text-gray-600">{filteredCount}</span> dari {totalCount} data
                    </div>
                </div>
            </div>

            {/*Filter Section*/}
            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:grid-cols-5">
                        <div className="space-y-1">
                            <Label htmlFor="startDate">Tanggal Mulai</Label>
                            <Input
                                type="date"
                                value={(filters as any).startDate}
                                onChange={(e) => onFilterChange('startDate', e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => onFilterChange('status', value === "all" ? "" : value)}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterOptions.statuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="jenis_pelanggaran">Tingkat Pelanggaran</Label>
                            <Select
                                value={filters.severity}
                                onValueChange={(e) => onFilterChange('severity', e === "all" ? "" : e)}
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Tingkat Pelanggaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterOptions.severities.map((severity) => (
                                        <SelectItem key={severity} value={severity}>
                                            {severity}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="jenis_pelanggaran">Jenis Pelanggaran</Label>
                            <Select
                                value={(filters as any).violationType}
                                onValueChange={(e) => onFilterChange('violationType', e === "all" ? "" : e)}
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Semua Jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Jenis</SelectItem>
                                    {filterOptions.types.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}