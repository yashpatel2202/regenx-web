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
            // Redirect to login, preserving return URL
            router.push(`/login`);
        } else {
            setAuthorized(true);
        }
    }, [router, pathname]);

    if (!authorized) {
        // You could render a loading spinner here
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return <>{children}</>;
}
