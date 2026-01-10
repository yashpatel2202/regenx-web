"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        } else {
            // Check expiry
            const parsed = JSON.parse(user);
            if (parsed.expiry && new Date().getTime() > parsed.expiry) {
                localStorage.removeItem("user");
                router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
            } else {
                setAuthorized(true);
            }
        }
    }, [router, pathname]);

    if (!authorized) {
        // You could render a loading spinner here
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return <>{children}</>;
}
