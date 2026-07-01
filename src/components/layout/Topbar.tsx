"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuItem
} from "../ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

interface UserData {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);

    const menuMap: Record<string, string> = {};
    const title = menuMap[pathname] || "SMK Brantas Karangkates";

    const handlelogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert(error.message);
                return;
            }
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();

                if (error || !data.user) {
                    console.error('Error fetching user: ', error);
                    router.push('/auth/login');
                    return;
                }

                // Ambil nama dari metadata registrasi auth, jika tidak ada pakai default "Nella Ayu"
                const name = data.user.user_metadata?.full_name ||
                    data.user.user_metadata?.name ||
                    "Nella Ayu";

                setUserData({
                    id: data.user.id,
                    email: data.user.email || '',
                    name: name,
                    avatar_url: data.user.user_metadata?.avatar_url || '',
                });
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();

        // Pantau status auth hanya menggunakan data session auth bawaan (tanpa query tabel profiles)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const { user } = session;
                const name = user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    "Nella Ayu";

                setUserData({
                    id: user.id,
                    email: user.email || '',
                    name: name,
                    avatar_url: user.user_metadata?.avatar_url || ''
                });
            } else {
                setUserData(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    // Fungsi ekstraksi inisial avatar
    const getInitials = (name: string) => {
        if (!name) return "NA";
        return name
            .trim()
            .split(/\s+/)
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-15 items-center justify-between px-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8 bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                                    {userData?.avatar_url && (
                                        <AvatarImage src={userData.avatar_url} alt={userData.name} />
                                    )}
                                    <AvatarFallback>
                                        {userData ? getInitials(userData.name) : "NA"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {userData?.name || "Nella Ayu"}
                                    </p>
                                    <p className="text-sm leading-none text-muted-foreground">
                                        {userData?.email || "nella@school.com"}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                onClick={handlelogout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}