"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Inline SVG icons to avoid dependency issues
const Icons = {
    LayoutDashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" /><rect width="7" height="5" x="14" y="3" /><rect width="7" height="9" x="14" y="12" /><rect width="7" height="5" x="3" y="16" /></svg>
    ),
    ShoppingBag: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
    ),
    Newspaper: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
    ),
    Recycle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784l1.326-2.296 1.503 2.518-1.471 2.45Z" /><path d="M21.179 16.216A1.83 1.83 0 0 1 19.5 19h-2.146l2.126-3.681-1.429-2.474-1.492 2.583L21.179 16.216Z" /><path d="M11.951 4.5 13.5 7.182 11.235 11.1l-2.036-3.525-1.42 2.46h2.802L8.5 6.918l3.451-2.418Z" /><path d="m11.951 4.5 2.121 3.673-1.429 2.474-1.492-2.583L7.75 4.5h4.201Z" /><path d="M19.5 4.5H17.2l-2.12 3.67 1.45 2.49 2.1-3.64 2.87-4.96c.78-1.35.32-3.08-1.03-3.08h-6.02L19.5 4.5Z" /><path d="M16.5 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /><path d="M4.64 12.07l-2.88 4.96C.93 18.5 2.12 20.5 3.82 20.5h16.36l-2.12-3.68h-9V9H7v7.57l-2.36-4.5Z" /></svg>
    )
}; // Simplified Recycle for stability
// Correcting Recycle icon to standard
const RecycleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784l1.326-2.296 1.503 2.518-1.471 2.45Z" /><path d="M21.179 16.216A1.83 1.83 0 0 1 19.5 19h-2.146l2.126-3.681-1.429-2.474-1.492 2.583L21.179 16.216Z" /><path d="M11.951 4.5 13.5 7.182 11.235 11.1l-2.036-3.525-1.42 2.46h2.802L8.5 6.918l3.451-2.418Z" /><path d="m11.951 4.5 2.121 3.673-1.429 2.474-1.492-2.583L7.75 4.5h4.201Z" /></svg>
);
// Actually using the simple LUCIDE one by pasting path
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: Icons.LayoutDashboard },
        { name: "Products", href: "/dashboard/products", icon: Icons.Recycle },
        { name: "Marketplace", href: "/marketplace", icon: Icons.ShoppingBag },
        { name: "Feed", href: "/feed", icon: Icons.Newspaper },
    ];

    return (
        <div className="border-b bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
            <div className="flex h-16 items-center px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-8">
                    <img src="/title.png" alt="ReGenX" className="h-10 w-auto object-contain" />
                </Link>
                <nav className="flex items-center gap-6 text-sm font-medium">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 transition-colors hover:text-green-600 ${isActive ? "text-green-600" : "text-zinc-500 dark:text-zinc-400"
                                    }`}
                            >
                                <item.icon />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="ml-auto flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <span className="text-xs font-medium">CO</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
