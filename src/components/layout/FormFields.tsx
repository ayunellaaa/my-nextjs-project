"use client"

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Kelas } from "@/types";

interface FormFieldProps {
    data: any;
    onChange: (key: string, value: string | number) => void;
    kelas: Kelas[];
}

export default function FormFields({ data, onChange, kelas }: FormFieldProps) {
    const formFields = [
        {
            id: 'nama',
            label: "Nama",
            type: "text",
            value: data.nama,
            placeholder: "Masukkan nama lengkap",
        },
        {
            id: 'nis',
            label: "NIS",
            type: "text",
            value: data.nis,
            placeholder: "Masukkan NIS",
        },
        {
            id: 'tanggal_lahir',
            label: "Tanggal Lahir",
            type: "date",
            value: data.tanggal_lahir,
            placeholder: "Masukkan tanggal lahir",
        },
        {
            id: 'alamat',
            label: "Alamat",
            type: "text",
            value: data.alamat,
            placeholder: "Masukkan alamat lengkap",
        },
    ];

    return (
        <div className="space-y-4 py-4">
            {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.label}
                    </Label>
                    <Input
                        id={field.id}
                        type={field.type}
                        value={field.value}
                        placeholder={field.placeholder}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className="w-full"
                    />
                </div>
            ))}
            <div className="space-y-2">
                <Label htmlFor="kelas_id" className="text-sm font-medium">
                    Kelas
                </Label>
                <Select
                    value={String(data.kelas_id || "")}
                    onValueChange={(val) => onChange("kelas_id", Number(val))}
                >
                    <SelectTrigger id="kelas" className="w-full">
                        <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                        {kelas.map((k) => (
                            <SelectItem key={k.id} value={String(k.id)}>
                                {k.kelas}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="jenis_kelamin" className="text-sm font-medium">
                    Jenis Kelamin
                </Label>
                <Select
                    value={String(data.jenis_kelamin || "")}
                    onValueChange={(val) => onChange("jenis_kelamin", val)}
                >
                    <SelectTrigger id="jenis_kelamin" className="w-full">
                        <SelectValue placeholder="Pilih Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}