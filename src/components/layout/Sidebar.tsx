"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Users, BarChart3, X } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Sheet, SheetContent } from "../ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface UserData {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);

    const menuItems = [
        { Label: "Dashboard", icon: Home, href: "/dashboard" },
        { Label: "Siswa", icon: Users, href: "/dashboard/siswa" },
        { Label: "Kelas", icon: BarChart3, href: "/dashboard/kelas" },
        { Label: "Pelanggaran", icon: BarChart3, href: "/dashboard/pelanggaran" },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error || !data.user) return;

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
                console.error('Error fetching user in sidebar:', error);
            }
        };

        fetchUser();

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
    }, []);

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

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-background">
            <div className="flex h-16 items-center justify-between px-6 border-b">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold text-sm">MS</span>
                    </div>
                    <h1 className="tracking-tight font-semibold text-lg">Manajemen Siswa</h1>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/*Navigation*/}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map(({ Label, icon: Icon, href }) => {
                    const isActive = href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                        >
                            <div className="flex items-center space-x-3">
                                <Icon className="h-4 w-4" />
                                <span>{Label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/*Footer User (Sudah Dinamis)*/}
            <div className="p-4 border-t">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8 bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                        {userData?.avatar_url && (
                            <AvatarImage src={userData.avatar_url} alt={userData.name} />
                        )}
                        <AvatarFallback>
                            {userData ? getInitials(userData.name) : "NA"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {userData?.name || "Nella Ayu"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {userData?.email || "nella@school.com"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/*Desktop Sidebar*/}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:border-r">
                <SidebarContent />
            </aside>
            {/*Mobile Sidebar*/}
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="w-64 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
}