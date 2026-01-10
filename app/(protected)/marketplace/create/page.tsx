"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateListingPage() {
    const router = useRouter();
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    const [formData, setFormData] = useState({
        title: searchParams?.get('name') || "",
        type: "Metal", // Could infer from title but default for now
        quantity: searchParams?.get('qty')?.replace(/[^0-9.]/g, '') || "",
        unit: "Tons",
        price: "",
        description: searchParams?.get('wasteId') ? "Generated from Waste Stream catalog." : "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // In a real implementation, POST to /api/listings
        // Mocking success for now
        console.log("Creating Listing:", formData);

        setTimeout(() => {
            setLoading(false);
            router.push("/marketplace");
        }, 1000);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Listing</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Post your industrial by-product for sale.</p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text" required
                                placeholder="e.g. Copper Wire Scraps"
                                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Material Type</label>
                            <select
                                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Metal</option>
                                <option>Plastic</option>
                                <option>Organic</option>
                                <option>Glass</option>
                                <option>Chemical</option>
                                <option>Construction</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Price Per Unit ($)</label>
                            <input
                                type="number" required
                                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                type="number" required
                                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Unit</label>
                            <select
                                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option>Tons</option>
                                <option>Kg</option>
                                <option>Liters</option>
                                <option>Units</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                        >
                            {loading ? "Publishing..." : "Publish Listing"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
