"use client";

import { useState } from "react";

export default function DashboardPage() {
    const [workflowText, setWorkflowText] = useState("");
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!workflowText) return;
        setLoading(true);
        try {
            const response = await fetch("/api/agents/workflow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workflowDescription: workflowText }),
            });
            const data = await response.json();
            setAnalysisResult(data.analysis);
        } catch (e) {
            console.error("Analysis failed", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Overview of your industrial waste management.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Waste Generated", value: "1,240 kg", change: "+12%", bg: "bg-orange-100 dark:bg-orange-900/20 text-orange-600" },
                    { title: "Revenue from Sales", value: "$4,200", change: "+8%", bg: "bg-green-100 dark:bg-green-900/20 text-green-600" },
                    { title: "CO2 Offset", value: "850 kg", change: "+24%", bg: "bg-blue-100 dark:bg-blue-900/20 text-blue-600" },
                    { title: "Active Listings", value: "12", change: "0%", bg: "bg-purple-100 dark:bg-purple-900/20 text-purple-600" },
                ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
                        <div className={`w-fit rounded-lg p-2 ${stat.bg} mb-4`}>
                            {/* Icon placeholder */}
                            <div className="w-5 h-5 rounded-full bg-current opacity-50"></div>
                        </div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                            <span className="text-xs font-medium text-green-500">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Workflow Analyzer */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">Workflow Waste Analyzer</h2>
                        <p className="text-sm text-zinc-500">Describe your production process to identify potential sellable by-products.</p>
                    </div>

                    <textarea
                        className="w-full h-32 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        placeholder="e.g. We manufacture steel pipes. The process involves cutting large sheets, welding, and polishing..."
                        value={workflowText}
                        onChange={(e) => setWorkflowText(e.target.value)}
                    />

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !workflowText}
                        className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Analyzing..." : "Analyze Workflow"}
                    </button>

                    {analysisResult && (
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                                <span className="text-sm font-medium">Optimization Score</span>
                                <span className="text-lg font-bold text-green-600">{analysisResult.efficiencyScore}%</span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Identified Opportunities</h3>
                                {analysisResult.identifiedWaste.map((item: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-green-500/50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold">{item.material}</h4>
                                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded-full">
                                                {Math.round(item.confidence * 100)}% Match
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500">Est: {item.estimatedQuantity}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {item.suggestedUses.map((use: string, i: number) => (
                                                <span key={i} className="text-xs border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-400">
                                                    {use}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity Mock */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">Recent Activity</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { text: "Sold 500kg of Scrap Metal to EcoBuild", time: "2h ago", type: "sale" },
                            { text: "New match found for Plastic Waste", time: "5h ago", type: "alert" },
                            { text: "Updated workflow: Assembly Line A", time: "1d ago", type: "update" },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900 last:border-0">
                                <div className={`w-2 h-2 mt-2 rounded-full ${activity.type === 'sale' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                <div>
                                    <p className="text-sm font-medium">{activity.text}</p>
                                    <p className="text-xs text-zinc-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
