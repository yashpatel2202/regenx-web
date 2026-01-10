"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductWorkflowsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        workflowText: ""
    });
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [selectedWasteItems, setSelectedWasteItems] = useState<any[]>([]);

    useEffect(() => {
        // Mock Auth check
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchProducts(userData.companyId);
    }, [router]);

    const fetchProducts = async (companyId: string) => {
        try {
            const res = await fetch(`/api/products?companyId=${companyId}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    const handleAnalyze = async () => {
        if (!formData.workflowText) return;
        setAnalyzing(true);
        setAnalysisResult(null);
        setSelectedWasteItems([]);
        try {
            const res = await fetch("/api/agents/workflow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workflowDescription: formData.workflowText }),
            });
            const data = await res.json();
            if (data.success) {
                setAnalysisResult(data.analysis);
                // Select all by default
                setSelectedWasteItems(data.analysis.identifiedWaste);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setAnalyzing(false);
        }
    };

    const toggleWasteSelection = (item: any) => {
        if (selectedWasteItems.includes(item)) {
            setSelectedWasteItems(selectedWasteItems.filter(i => i !== item));
        } else {
            setSelectedWasteItems([...selectedWasteItems, item]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 1. Create Product
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId: user?.companyId,
                    name: formData.name,
                    description: formData.description,
                    workflowText: formData.workflowText
                }),
            });
            const data = await res.json();

            if (data.success) {
                const newProductId = data.product.id;

                // 2. Save Selected Waste Items (if any)
                if (selectedWasteItems.length > 0) {
                    await fetch("/api/products/waste", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            productId: newProductId,
                            wasteItems: selectedWasteItems
                        }),
                    });
                }

                // 3. Save Identified Input Components (if analyzed)
                if (analysisResult?.requiredInputs && analysisResult.requiredInputs.length > 0) {
                    await fetch("/api/products/components", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            productId: newProductId,
                            components: analysisResult.requiredInputs
                        }),
                    });
                }

                setShowForm(false);
                setFormData({ name: "", description: "", workflowText: "" });
                setAnalysisResult(null);
                fetchProducts(user.companyId);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Product Workflows</h1>
                    <p className="text-zinc-500">Manage manufacturing processes and identify waste streams.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        + Add Product Workflow
                    </button>
                )}
            </div>

            {/* Add Workflow Form */}
            {showForm && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">New Production Process</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product/Process Name</label>
                                <input
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Steel Pipe Production"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Short Description</label>
                                <input
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief summary..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Detailed Process / Workflow Document</label>
                            <textarea
                                className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent h-32"
                                value={formData.workflowText}
                                onChange={e => setFormData({ ...formData, workflowText: e.target.value })}
                                placeholder="Describe the raw materials, steps, and outputs in detail to help AI identify waste..."
                                required
                            />
                        </div>

                        {/* Analysis Section */}
                        <div className="flex gap-4 items-center">
                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={analyzing || !formData.workflowText}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                {analyzing ? "AI Analyzing..." : "Analyze Waste Stream"}
                            </button>
                            {analyzing && <span className="text-sm text-zinc-500 animate-pulse">Parsing workflow document...</span>}
                        </div>

                        {/* Analysis Results Selection */}
                        {analysisResult && (
                            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                <h3 className="font-bold text-purple-700 dark:text-purple-400 mb-2">Analysis Results</h3>
                                <p className="text-sm mb-4">{analysisResult.optimizationSuggestions}</p>

                                {analysisResult.requiredInputs && analysisResult.requiredInputs.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-bold mb-2">Identified Required Inputs:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisResult.requiredInputs.map((input: any, i: number) => (
                                                <span key={i} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-200">
                                                    {input.material}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <h4 className="text-sm font-bold mb-2">Select Waste Items to Catalog:</h4>
                                <div className="space-y-2">
                                    {analysisResult.identifiedWaste.map((w: any, idx: number) => (
                                        <div key={idx} className="flex items-start gap-2 p-2 bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800">
                                            <input
                                                type="checkbox"
                                                checked={selectedWasteItems.includes(w)}
                                                onChange={() => toggleWasteSelection(w)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-sm">{w.material}</span>
                                                    <span className="text-xs text-zinc-400">Conf: {Math.round(w.confidence * 100)}%</span>
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                    Stage: {w.stage} | Est: {w.estimatedQuantity}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                                Save Workflow & Catalog
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setAnalysisResult(null); }}
                                className="px-6 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Product List */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${showForm ? 'opacity-50 pointer-events-none' : ''}`}>
                {products.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl hover:shadow-md transition flex flex-col h-full">
                        <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                        <p className="text-zinc-500 text-sm mb-4 line-clamp-2 flex-1">{product.workflow_document_text}</p>

                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-xs text-zinc-400">{new Date(product.created_at).toLocaleDateString()}</span>
                            <div className="flex gap-3">
                                {product.matchCount > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                        ⚡ {product.matchCount} Inputs Available
                                    </span>
                                )}
                                <button
                                    onClick={() => router.push(`/dashboard/products/${product.id}`)}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                >
                                    View Details →
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {products.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-zinc-500">
                        No products found. Add your first manufacturing workflow above.
                    </div>
                )}
            </div>
        </div>
    );
}
