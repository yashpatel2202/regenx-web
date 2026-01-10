"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Analyzer State
    const [workflowText, setWorkflowText] = useState("");
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchStats(userData.companyId);
    }, [router]);

    const fetchStats = async (companyId: string) => {
        try {
            const res = await fetch(`/api/dashboard/stats?companyId=${companyId}`);
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleAnalyze = async () => {
        if (!workflowText) return;
        setAnalyzing(true);
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
            setAnalyzing(false);
        }
    };

    if (loadingStats) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Welcome back, {user?.name}. Overview of your circular economy impact.</p>
            </div>

            {/* AI Insight Banner */}
            {stats?.insight && (
                <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 p-6 rounded-xl shadow-sm flex items-start gap-4">
                    <span className="text-3xl">✨</span>
                    <div>
                        <h3 className="font-bold text-lg mb-1 text-zinc-900 dark:text-zinc-100">Daily AI Insight</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">{stats.insight}</p>
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                    { title: "Waste Streams Identified", value: stats?.wasteCount || 0, icon: "🗑️", bg: "bg-orange-100 dark:bg-orange-900/20 text-orange-600" },
                    { title: "Revenue from Waste", value: `$${stats?.revenue?.toLocaleString() || 0}`, icon: "💰", bg: "bg-green-100 dark:bg-green-900/20 text-green-600" },
                    { title: "Active Listings", value: stats?.activeListings || 0, icon: "📦", bg: "bg-purple-100 dark:bg-purple-900/20 text-purple-600" },
                ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-full ${stat.bg} text-2xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
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
                        disabled={analyzing || !workflowText}
                        className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {analyzing ? "Analyzing..." : "Analyze Workflow"}
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

                {/* Recent Activity */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">Recent Activity</h2>
                    </div>
                    <div className="space-y-4">
                        {stats?.activities && stats.activities.length > 0 ? (
                            stats.activities.map((activity: any, i: number) => (
                                <div key={i} className="flex items-start gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900 last:border-0">
                                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${activity.type === 'sale' ? 'bg-green-500' :
                                        activity.type === 'purchase' ? 'bg-blue-500' : 'bg-orange-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{activity.text}</p>
                                        <p className="text-xs text-zinc-500">{new Date(activity.created_at).toLocaleDateString()} {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-zinc-500 text-center py-8">No recent activity found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
