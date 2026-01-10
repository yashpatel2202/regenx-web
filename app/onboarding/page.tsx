"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        industryType: "",
        description: "",
        address: "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // In a real app, this would submit to an API to create the Company and link to User
        // For now, we simulate success and redirect
        console.log("Submitting Company Data:", formData);

        setTimeout(() => {
            setLoading(false);
            router.push("/dashboard");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h1 className="text-2xl font-bold mb-2">Welcome to ReGenX</h1>
                <p className="text-zinc-500 text-sm mb-6">Complete your company profile to start matching.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Company Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                            rows={3}
                            placeholder="What does your company produce?"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <input
                            type="text"
                            className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        {loading ? "Creating Profile..." : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}
