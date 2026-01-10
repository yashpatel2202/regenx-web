"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Auto-redirect if already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.expiry && new Date().getTime() < parsed.expiry) {
                router.push("/dashboard");
            }
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                // Determine user context storage (mocking session behavior with expiry)
                // Set expiry to 7 days from now
                const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
                localStorage.setItem("user", JSON.stringify({ ...data.user, expiry }));

                // Check for returnUrl
                const params = new URLSearchParams(window.location.search);
                const returnUrl = params.get("returnUrl");
                router.push(returnUrl || "/dashboard");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-center mb-6">
                    <img src="/title.png" alt="ReGenX" className="h-12 w-auto object-contain" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-center">Sign In</h1>
                <p className="text-zinc-500 text-sm mb-6 text-center">Access your company dashboard.</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-500">
                    Don't have an account?{" "}
                    <Link href="/onboarding" className="text-green-600 hover:underline">
                        Register Company
                    </Link>
                </div>
            </div>
        </div>
    );
}
