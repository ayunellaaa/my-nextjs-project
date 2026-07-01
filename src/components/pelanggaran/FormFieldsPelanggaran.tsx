"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Camera } from "lucide-react";
import { useMemo, useState, useRef } from "react";
import type { Siswa } from "@/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const TINGKAT_OPTIONS = ["Berat", "Sedang", "Ringan"] as const;
const STATUS_OPTIONS = ["Aktif", "Selesai"] as const;

export interface PelanggaranFormData {
    siswa_id: number;
    jenis_pelanggaran: string;
    tingkat: string;
    poin: number;
    tanggal: string;
    waktu: string;
    lokasi: string;
    deskripsi: string;
    status: string;
    tindakan: string | null;
    tanggal_tindak_lanjut: string | null;
    catatan: string | null;
    url: string | null;
}

interface FormFieldsPelanggaranProps {
    form: PelanggaranFormData;
    onChange: <K extends keyof PelanggaranFormData>(key: K, value: PelanggaranFormData[K]) => void;
    dataSiswa?: Siswa[];
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    previewUrl?: string;
    onRemoveFile?: () => void;
    showSiswaFields?: boolean;
    showOptionalFields?: boolean;
    onCameraCapture?: (base64Image: string) => void;
}

export function FormFieldsPelanggaran({
    form,
    onChange,
    dataSiswa = [],
    searchQuery = '',
    onSearchChange,
    previewUrl,
    onRemoveFile,
    showSiswaFields = true,
    showOptionalFields = true,
    onCameraCapture,
}: FormFieldsPelanggaranProps) {

    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const filteredSiswa = useMemo(() => {
        if (!searchQuery.trim() || !dataSiswa.length) return dataSiswa;
        const query = searchQuery.toLowerCase();
        return dataSiswa.filter(siswa =>
            siswa.nama.toLowerCase().includes(query) ||
            siswa.nis.toLowerCase().includes(query)
        );
    }, [dataSiswa, searchQuery]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setIsCameraActive(true);

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (error) {
            console.error("Gagal mengakses kamera:", error);
            alert("Kamera tidak diizinkan atau tidak ditemukan.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        setIsCameraActive(false);
        setStream(null);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL("image/png");

                if (onCameraCapture) {
                    onCameraCapture(imageDataUrl);
                }
            }
            stopCamera();
        }
    };

    return (
        <div className="space-y-4">
            {showSiswaFields && (
                <div className="space-y-2">
                    <Label htmlFor="siswa" className="text-sm font-medium">
                        Siswa <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="siswa"
                            placeholder="Cari siswa berdasarkan nama atau NIS"
                            value={searchQuery}
                            onChange={(e) => {
                                onSearchChange?.(e.target.value);
                                onChange('siswa_id', 0);
                            }}
                            className="pl-2 w-full"
                        />
                    </div>
                    {searchQuery && !form.siswa_id && (
                        <div className="max-h-48 overflow-y-auto border rounded-md bg-white shadow-lg">
                            {filteredSiswa.length > 0 ? (
                                filteredSiswa.map((siswa) => (
                                    <button
                                        key={siswa.id}
                                        type="button"
                                        onClick={() => {
                                            onChange('siswa_id', siswa.id);
                                            onSearchChange?.(`${siswa.nama} (${siswa.nis})`);
                                        }}
                                        className={`w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 ${form.siswa_id === siswa.id ? 'bg-gray-100' : ''}`}
                                    >
                                        <div>
                                            <div className="font-medium text-black text-sm">{siswa.nama}</div>
                                            <div className="text-xs text-gray-500">{siswa.nis}</div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-3 px-4 text-gray-500">Siswa tidak ditemukan</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="jenis" className="text-sm font-medium">
                        Jenis Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="jenis"
                        value={form.jenis_pelanggaran}
                        onChange={(e) => onChange('jenis_pelanggaran', e.target.value)}
                        placeholder="Contoh: Terlambat, Tidak berseragam"
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tingkat" className="text-sm font-medium">
                        Tingkat Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Select value={form.tingkat} onValueChange={(v) => onChange('tingkat', v)}>
                        <SelectTrigger id="tingkat" className="w-full">
                            <SelectValue placeholder="Pilih Tingkat Pelanggaran" />
                        </SelectTrigger>
                        <SelectContent>
                            {TINGKAT_OPTIONS.map((tingkat) => (
                                <SelectItem key={tingkat} value={tingkat}>
                                    {tingkat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="poin" className="text-sm font-medium">
                        Poin <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="poin"
                        type="number"
                        min="0"
                        value={form.poin}
                        onChange={(e) => onChange('poin', parseInt(e.target.value) || 0)}
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tanggal" className="text-sm font-medium">
                        Tanggal Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="tanggal"
                        type="date"
                        value={form.tanggal}
                        onChange={(e) => onChange('tanggal', e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="waktu" className="text-sm font-medium">
                        Waktu Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="waktu"
                        type="time"
                        value={form.waktu}
                        onChange={(e) => onChange('waktu', e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lokasi" className="text-sm font-medium">
                        Lokasi Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="lokasi"
                        value={form.lokasi}
                        onChange={(e) => onChange('lokasi', e.target.value)}
                        placeholder="Contoh: Kelas, Lapangan"
                        className="w-full"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="deskripsi" className="text-sm font-medium">
                        Deskripsi Pelanggaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="deskripsi"
                        value={form.deskripsi}
                        onChange={(e) => onChange('deskripsi', e.target.value)}
                        placeholder="Contoh: Terlambat dikarenakan ban bocor"
                        className="w-full"
                    />
                </div>

                {showOptionalFields && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="tindakan" className="text-sm font-medium">
                                Tindakan
                            </Label>
                            <Input
                                id="tindakan"
                                value={form.tindakan || ""}
                                onChange={(e) => onChange('tindakan', e.target.value || null)}
                                placeholder="Tindakan yang diambil"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tanggal_tindak_lanjut" className="text-sm font-medium">
                                Tanggal Tindak Lanjut
                            </Label>
                            <Input
                                id="tanggal_tindak_lanjut"
                                type="date"
                                value={form.tanggal_tindak_lanjut || ""}
                                onChange={(e) => onChange('tanggal_tindak_lanjut', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="catatan" className="text-sm font-medium">
                                Catatan
                            </Label>
                            <Input
                                id="catatan"
                                value={form.catatan || ""}
                                onChange={(e) => onChange('catatan', e.target.value)}
                                placeholder="Contoh: Orang tua sudah dihubungi"
                                className="w-full"
                            />
                        </div>
                    </>
                )}

                {/* --- SEKSI BUKTI FOTO MURNI KAMERA --- */}
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium">
                        Foto Bukti <span className="text-gray-500 text-xs">(Ambil via Kamera)</span>
                    </Label>

                    {previewUrl ? (
                        <div className="relative w-full h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
                            <Image
                                src={previewUrl}
                                alt="Preview Kamera"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                            <button
                                type="button"
                                onClick={onRemoveFile}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                            {isCameraActive ? (
                                <div className="flex flex-col gap-3 w-full max-w-md">
                                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border bg-black scale-x-[-1]" />
                                    <div className="flex gap-2">
                                        <Button type="button" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={capturePhoto}>
                                            Jepret Foto
                                        </Button>
                                        <Button type="button" variant="outline" onClick={stopCamera}>
                                            Matikan Kamera
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 mb-3">Foto pelanggaran diambil langsung melalui kamera perangkat.</p>
                                    <Button type="button" variant="secondary" onClick={startCamera} className="w-full max-w-xs">
                                        Buka Kamera
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export { TINGKAT_OPTIONS, STATUS_OPTIONS };