"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import AddKelasDialog from "@/components/kelas/AddKelasDialog";
import EditKelasDialog from "@/components/kelas/EditKelasDialog";
import KelasTable from "@/components/kelas/KelasTable";
import { Kelas } from "@/types";
import { supabase } from "@/lib/supabase";

type KelasFormData = {
    kelas: string;
};

const initialFormData: KelasFormData = {
    kelas: "",
};


export default function KelasPage() {
    const [kelas, setKelas] = useState<Kelas[]>([]);
    const [addform, setAddForm] = useState<KelasFormData>(initialFormData);
    const [editform, setEditForm] = useState<KelasFormData>(initialFormData);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchKelas();
    }, []);

    const fetchKelas = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("kelas")
                .select("*")
                .order("id", { ascending: true });
            setKelas(data || []);
        } catch (error) {
            console.error('Error fetching kelas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddChange = (key: string, value: string) => {
        setAddForm(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleEditChange = (key: string, value: string) => {
        setEditForm(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleAdd = async () => {
        try {
            if (!addform.kelas.trim()) {
                alert("Nama kelas wajib diisi.");
                return;
            }
            const { data, error } = await supabase
                .from("kelas")
                .insert([{ kelas: addform.kelas }])
                .select("*")
                .single();

            if (error) {
                console.error("error inserting kelas: ", error);
                return;
            }

            setKelas((prev) => [...prev, data as Kelas]);
            setAddForm(initialFormData);
            setAddDialogOpen(false);
        } catch (error) {
            console.error('Unexpected error:', error);
            alert("Error");
        }
    };

    const handleEditClick = (items: Kelas) => {
        setEditingId(items.id);
        setEditForm({ kelas: items.kelas });
        setEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        try {
            if (!editingId === null) return;
            if (!editform.kelas.trim()) {
                alert("Nama kelas wajib diisi.");
                return;
            }

            const { data, error } = await supabase
                .from("kelas")
                .update({ kelas: editform.kelas })
                .eq("id", editingId)
                .select("*")
                .single();

            if (error) {
                console.error("error updating: ", error);
                return;
            }

            setKelas((prev) => prev.map(k => k.id === editingId
                ? data
                : k
            ));
            setEditForm(initialFormData);
            setEditDialogOpen(false);
            setEditingId(null);
        } catch (error) {
            console.error('Unexpected error:', error);
            alert("Error");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const { error } = await supabase
                .from("kelas")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("error deleting: ", error);
                return;
            }

            setKelas((prev) => prev.filter(k => k.id !== id));
        } catch (error) {
            console.error('Unexpected error:', error);
            alert("Error");
        }
    };

    const hadleEditDialogClose = (open: boolean) => {
        setEditDialogOpen(open);
        if (!open) {
            setAddForm(initialFormData);
        }
    };

    const handleAddDialogClose = (open: boolean) => {
        setAddDialogOpen(open);
        if (!open) {
            setEditForm(initialFormData);
            setEditingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Data Kelas</h1>

            <Card className="p-4 shadow text-center">
                <KelasTable
                    data={kelas}
                    handleEditClick={handleEditClick}
                    handleDelete={handleDelete}
                    addDialog={
                        <AddKelasDialog
                            open={addDialogOpen}
                            setOpen={handleAddDialogClose}
                            form={addform}
                            handleChange={handleAddChange}
                            handleAdd={handleAdd}
                        />}
                />
                <EditKelasDialog
                    open={editDialogOpen}
                    setOpen={hadleEditDialogClose}
                    form={editform}
                    handleChange={handleEditChange}
                    handleUpdate={handleUpdate}
                />
            </Card>
        </div>
    );
}