"use client";

import { useState, useEffect } from "react";

export default function MarketplacePage() {
    const [materialFilter, setMaterialFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);

    // Mock initial listings
    const [listings, setListings] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        // Load user from storage
        const stored = localStorage.getItem("user");
        if (stored) setCurrentUser(JSON.parse(stored));

        fetch("/api/listings")
            .then(res => res.json())
            .then(data => {
                if (data.success) setListings(data.listings);
            })
            .catch(err => console.error("Failed to fetch listings", err));
    }, []);

    const handleMatchmake = async (material: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/agents/matchmaker?material=${material}`);
            const data = await response.json();
            if (data.success) {
                setMatches(data.matches);
            }
        } catch (e) {
            console.error("Matchmaking failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item: any) => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert("Please login to purchase");
            return;
        }
        const user = JSON.parse(storedUser);

        // Simple confirmation
        const total = item.raw_quantity * item.raw_price;
        if (!confirm(`Are you sure you want to place an order for ${item.title}?\n\nQuantity: ${item.quantity}\nEstimated Total: ₹${total.toLocaleString()}`)) {
            return;
        }

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: item.id,
                    buyerCompanyId: user.companyId,
                    quantity: item.raw_quantity,
                    totalPrice: total
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert("Order placed successfully! Check 'Orders' page for status.");
            } else {
                alert("Failed to place order: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error placing order");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Buy and sell industrial by-products.</p>
                </div>
                <button
                    onClick={() => window.location.href = '/marketplace/create'}
                    className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
                >
                    Create Listing
                </button>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                        <h3 className="font-semibold mb-4">Filters</h3>
                        <div className="space-y-2">
                            {["All", "Metal", "Plastic", "Organic", "Glass", "Chemical"].map((type) => (
                                <label key={type} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                    <input type="checkbox" className="rounded border-zinc-300" />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-green-50 dark:bg-green-900/10 p-6">
                        <h3 className="font-semibold mb-2 text-green-700 dark:text-green-500">AI Matchmaker</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
                            Use our agent to find the perfect buyer/seller for specific materials.
                        </p>
                        <input
                            type="text"
                            placeholder="e.g. Steel"
                            className="w-full text-sm p-2 rounded border border-zinc-200 dark:border-zinc-700 mb-2 bg-white dark:bg-black"
                            value={materialFilter}
                            onChange={(e) => setMaterialFilter(e.target.value)}
                        />
                        <button
                            onClick={() => handleMatchmake(materialFilter)}
                            disabled={!materialFilter || loading}
                            className="w-full bg-green-600 text-white text-sm py-2 rounded hover:bg-green-700 transition"
                        >
                            {loading ? "Finding..." : "Find Matches"}
                        </button>
                    </div>
                </div>

                {/* Grid or Match Results */}
                <div className="lg:col-span-3 space-y-6">
                    {matches.length > 0 && (
                        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-green-800 dark:text-green-400">AI Recommendations</h3>
                                <button onClick={() => setMatches([])} className="text-xs text-zinc-500 hover:text-zinc-900">Clear</button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {matches.map((match, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-green-100 dark:border-zinc-800">
                                        <div className="font-semibold">{match.companyName}</div>
                                        <div className="text-sm text-zinc-500">{match.industry}</div>
                                        <div className="mt-2 text-xs text-zinc-400">Match Score: <span className="text-green-600 font-bold">{match.matchScore * 100}%</span></div>
                                        <p className="mt-2 text-sm italic">&quot;{match.reason}&quot;</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                        {listings.map((item) => (
                            <div key={item.id} className="group overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all hover:border-green-500/50 hover:shadow-md">
                                <div className="h-32 bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-400">
                                    {/* Placeholder Image */}
                                    <span className="text-4xl opacity-20 font-bold">{item.type[0]}</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-lg truncate pr-2">{item.title}</h3>
                                        <span className="text-xs font-medium px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full">{item.type}</span>
                                    </div>
                                    <p className="text-zinc-500 text-sm mt-1">{item.seller}</p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-zinc-400">Quantity</div>
                                            <div className="font-medium">{item.quantity}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-400 text-right">Price</div>
                                            <div className="font-medium text-green-600">{item.price}</div>
                                        </div>
                                    </div>

                                    {currentUser && currentUser.companyId === item.companyId ? (
                                        <button
                                            disabled
                                            className="w-full mt-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 py-2 rounded-lg text-sm font-medium cursor-not-allowed border border-zinc-200 dark:border-zinc-700"
                                        >
                                            Your Listing
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleBuy(item)}
                                            className="w-full mt-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                                        >
                                            Place Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper function not in component, but need inside component or define inside.
// Since I can't easily see where component starts/ends safely with Search/Replace line numbers without seeing full file context again, 
// I will just insert handleBuy inside the component and the button in the map loop.
// Actually, I'll do two edits or one big one. I have the file content.
// Insert handleBuy before return.

