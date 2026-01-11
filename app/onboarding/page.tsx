/**
 * @fileoverview Onboarding/Registration Page
 * @description Handles creation of new Company and Admin User entities.
 * Collects industry details, company metadata, and user credentials.
 * Creates authenticated session upon successful registration.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        // Company Fields
        companyName: "",
        industryType: "",
        description: "",
        address: "",
        // User Fields
        userName: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                // Auto-login (mock)
                const expiry = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
                localStorage.setItem("user", JSON.stringify({ ...data.user, expiry }));
                router.push("/dashboard");
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h1 className="text-2xl font-bold mb-2">Company Onboarding</h1>
                <p className="text-zinc-500 text-sm mb-6">Register your organization and creator account on ReGenX.</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Company Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2 border-zinc-100 dark:border-zinc-800">Company Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Industry Type</label>
                                <select
                                    required
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                    value={formData.industryType}
                                    onChange={e => setFormData({ ...formData, industryType: e.target.value })}
                                >
                                    <option value="">Select Industry</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Energy">Energy</option>
                                    <option value="Agriculture">Agriculture</option>
                                    <option value="Chemical">Chemical</option>
                                    <option value="Technology">Technology</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                    rows={2}
                                    placeholder="What does your company produce?"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admin User Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2 border-zinc-100 dark:border-zinc-800">Admin Account</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                    value={formData.userName}
                                    onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        {loading ? "Registering..." : "Create Account & Company"}
                    </button>

                    <div className="mt-4 text-center text-sm text-zinc-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-green-600 hover:underline">
                            Login here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
