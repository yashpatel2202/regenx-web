"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [wasteStreams, setWasteStreams] = useState<any[]>([]);
    const [loadingWaste, setLoadingWaste] = useState(false);

    // Optimization State
    const [checkingViability, setCheckingViability] = useState(false);
    const [suggestionReady, setSuggestionReady] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<any>(null);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [orderedListings, setOrderedListings] = useState<string[]>([]); // Track ordered listings

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handlePlaceOrder = async (listing: any) => {
        if (!confirm(`Place order for ${listing.title} from ${listing.seller_name}?`)) return;

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: listing.id,
                    buyerCompanyId: user?.companyId,
                    quantity: 100, // Defaulting to 100 or need logic. For now default.
                    totalPrice: 100 * listing.price_per_unit // Simple calc
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert("Order placed successfully!");
                setOrderedListings(prev => [...prev, listing.id]); // Mark as ordered locally
                fetchProductDetails();
            } else {
                alert("Failed to place order: " + data.error);
            }
        } catch (error) {
            console.error("Order error", error);
            alert("Error placing order");
        }
    };

    useEffect(() => {
        if (productId) {
            fetchProductDetails();
            fetchWasteStreams();
        }
    }, [productId]);

    // Proactive AI Check
    useEffect(() => {
        if (product && product.matchCount > 0 && !suggestionReady && !checkingViability) {
            checkViabilityAndGenerate();
        }
    }, [product]);

    const fetchProductDetails = async () => {
        try {
            const res = await fetch(`/api/products?productId=${productId}`);
            const data = await res.json();
            if (data.success) {
                setProduct(data.product);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWasteStreams = async () => {
        setLoadingWaste(true);
        try {
            const res = await fetch(`/api/products/waste?productId=${productId}`);
            const data = await res.json();
            if (data.success) {
                setWasteStreams(data.wasteStreams);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingWaste(false);
        }
    };

    const checkViabilityAndGenerate = async () => {
        setCheckingViability(true);
        try {
            // Gather available materials
            const availableMaterials = product.componentMatches
                .flatMap((m: any) => m.availableListings)
                .map((l: any) => `${l.title} (${l.price_per_unit}/${l.unit})`);

            const res = await fetch("/api/agents/suggest_alternates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalWorkflow: product.workflow_document_text,
                    availableMaterials
                }),
            });
            const data = await res.json();
            if (data.success && data.data) {
                setOptimizationResult(data.data);
                setSuggestionReady(true);
            }
        } catch (error) {
            console.error("Viability check failed:", error);
        } finally {
            setCheckingViability(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!product) return <div className="p-8">Product not found</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <button
                onClick={() => router.back()}
                className="mb-6 text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
            >
                ← Back to Products
            </button>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 mb-8 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                        <p className="text-zinc-500">{product.description}</p>
                    </div>
                    <span className="text-xs text-zinc-400">Created: {new Date(product.created_at).toLocaleDateString()}</span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 mb-8">
                    <h3 className="font-semibold mb-2">Workflow Process Description</h3>
                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-line">{product.workflow_document_text}</p>
                </div>

                {/* Input Components & Marketplace Matches */}
                {product.components && product.components.length > 0 && (
                    <div className="mb-8 p-6 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <h3 className="font-bold text-amber-800 dark:text-amber-500 mb-4 flex items-center gap-2">
                            ⚡ Supply Chain Optimization (Marketplace Available)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {product.components.map((comp: any) => {
                                const match = product.componentMatches?.find((m: any) => m.componentName === comp.material_name);
                                return (
                                    <div key={comp.id} className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Required Input</span>
                                                <div className="font-medium text-lg text-zinc-900 dark:text-zinc-100">{comp.material_name}</div>
                                                {comp.estimated_quantity && <div className="text-xs text-zinc-500">Est: {comp.estimated_quantity}</div>}
                                            </div>

                                            {match ? (
                                                <div className="text-right">
                                                    <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold mb-1">
                                                        {match.availableListings.length} Matches
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">No Matches</span>
                                            )}
                                        </div>

                                        {match && (
                                            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                                <p className="text-xs text-zinc-500 mb-2">Best available options:</p>
                                                <div className="space-y-2">
                                                    {match.availableListings.map((l: any) => (
                                                        <div key={l.id} className="flex justify-between items-center text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded border border-zinc-100 dark:border-zinc-700">
                                                            <div className="flex flex-col">
                                                                <span className="text-green-700 font-medium">{l.seller_name}</span>
                                                                <span className="text-zinc-600">{l.price_per_unit}/{l.unit}</span>
                                                            </div>
                                                            {orderedListings.includes(l.id) ? (
                                                                <button
                                                                    disabled
                                                                    className="bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded text-[10px] font-medium cursor-default"
                                                                >
                                                                    ✓ Order Posted
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handlePlaceOrder(l)}
                                                                    className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] hover:bg-blue-700 transition"
                                                                >
                                                                    Post Order
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Optimization Agent Button - Only show if AI confirmed viability */}
                        {product.matchCount > 0 && suggestionReady && (
                            <div className="mt-6 pt-6 border-t border-amber-200 dark:border-amber-800">
                                {!showSuggestion ? (
                                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-lg border border-amber-200">
                                        <div>
                                            <h4 className="font-bold text-amber-800">AI Sustainable Workflow Engine</h4>
                                            <p className="text-sm text-amber-700/80">
                                                We found marketplace matches that match your identified inputs.
                                                Our AI has generated an alternate workflow for you.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowSuggestion(true)}
                                            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 font-medium shadow-sm transition transform hover:scale-105"
                                        >
                                            ✨ Suggest Alternate Workflow
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-green-200 dark:border-green-900 shadow-md">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">♻️</span>
                                                <h4 className="text-lg font-bold text-green-700">Sustainable Workflow Proposal</h4>
                                            </div>
                                            <button
                                                onClick={() => setShowSuggestion(false)}
                                                className="text-xs text-zinc-400 hover:text-zinc-600"
                                            >
                                                Hide
                                            </button>
                                        </div>

                                        <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-line mb-6">
                                            {optimizationResult.optimizedWorkflow}
                                        </div>

                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/50 flex gap-4 items-center">
                                            <div className="bg-green-100 text-green-800 p-2 rounded-full">📉</div>
                                            <div>
                                                <div className="text-xs uppercase tracking-wider font-bold text-green-800">Projected Impact</div>
                                                <div className="font-medium text-green-900 dark:text-green-100">{optimizationResult.sustainabilityImpact}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span>🗑️</span> Waste Output Catalog
                </h3>

                {loadingWaste ? (
                    <div className="p-8 text-center text-zinc-500">Loading catalog...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wasteStreams.length > 0 ? (
                            wasteStreams.map((waste) => (
                                <div key={waste.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="font-bold text-lg">{waste.material_name}</div>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{waste.stage || 'General'}</span>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Est. Quantity:</span>
                                            <span className="font-medium">{waste.estimated_quantity}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Confidence:</span>
                                            <span className="font-medium">{Math.round((waste.confidence_score || 0) * 100)}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Status:</span>
                                            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">{waste.status}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/marketplace/create?wasteId=${waste.id}&name=${encodeURIComponent(waste.material_name)}`)}
                                        className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg font-medium hover:opacity-90 transition text-sm"
                                    >
                                        Post to Marketplace
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-xl">
                                <p className="text-zinc-500">No waste streams identified for this workflow yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
