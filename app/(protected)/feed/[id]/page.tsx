"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BrainCircuit, Zap } from "lucide-react";

export default function FeedDetailPage() {
    const params = useParams();
    const router = useRouter();
    const feedId = params.id as string;

    const [news, setNews] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) return;
            const user = JSON.parse(storedUser);

            try {
                // Call the new Analysis endpoint
                const res = await fetch("/api/news/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        newsId: feedId,
                        companyId: user.companyId
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    setNews(data.news);
                    setAnalysis(data.analysis);
                }
            } catch (error) {
                console.error("Failed to analyze", error);
            } finally {
                setLoading(false);
            }
        };

        if (feedId) {
            fetchAnalysis();
        }
    }, [feedId]);

    if (loading) return (
        <div className="p-8 max-w-4xl mx-auto space-y-12 animate-pulse">
            <div className="space-y-4">
                <div className="flex gap-3">
                    <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                    <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                </div>
                <div className="h-12 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="space-y-2 pt-4">
                    <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
            </div>

            <div className="space-y-8">
                <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
            </div>
        </div>
    );

    if (!news) return <div className="p-12 text-center">News item not found</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="mb-6 text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
            >
                ← Back to Feed
            </button>

            <article className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${news.category === 'Innovation' ? 'bg-purple-100 text-purple-800' :
                        news.category === 'Regulation' ? 'bg-amber-100 text-amber-800' :
                            news.category === 'Market' ? 'bg-green-100 text-green-800' :
                                news.category === 'Hazard' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                        }`}>
                        {news.category}
                    </span>
                    <span className="text-zinc-400 text-sm">{new Date(news.created_at).toLocaleDateString()}</span>
                </div>
                <h1 className="text-4xl font-bold mb-6 text-zinc-900 dark:text-zinc-100 leading-tight">{news.title}</h1>

                <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300">
                    <p className="whitespace-pre-line text-lg mb-4">{analysis?.summary || news.summary}</p>
                    <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 text-sm italic overflow-hidden">
                        <span className="text-zinc-500 mr-2">Original Source:</span>
                        <a href={news.source_url} target="_blank" className="text-blue-600 hover:underline truncate block" rel="noopener noreferrer">
                            {news.source_url}
                        </a>
                    </div>
                </div>
            </article>

            {/* AI Analysis Section */}
            <div className="space-y-8">
                {/* Proposed Solutions */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <BrainCircuit className="w-8 h-8 text-zinc-400" />
                        <h2 className="text-xl font-bold">Strategic Considerations</h2>
                    </div>
                    <div className="grid gap-4">
                        {analysis?.solutions?.map((sol: string, i: number) => (
                            <div key={i} className="flex gap-4 items-start p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0">
                                    {i + 1}
                                </span>
                                <p className="text-zinc-700 dark:text-zinc-300">{sol}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Personalized Waste Opportunities */}
                {analysis?.matches && analysis.matches.length > 0 ? (
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-8 h-8 text-green-600" />
                            <div>
                                <h2 className="text-xl font-bold text-green-900 dark:text-green-100">Your Opportunity Matches</h2>
                                <p className="text-green-700/80 dark:text-green-400 text-sm">We found specific relevance to your waste streams.</p>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            {analysis.matches.map((match: any, i: number) => (
                                <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-green-100 dark:border-green-900/50">
                                    <div className="text-xs uppercase tracking-wider font-bold text-zinc-400 mb-1">Relevant Stream</div>
                                    <h3 className="font-bold text-lg mb-2 text-green-700">{match.waste_name}</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300">{match.suggestion}</p>
                                    <button
                                        className="mt-4 text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition flex items-center gap-1"
                                        onClick={() => router.push(`/marketplace/create?material=${encodeURIComponent(match.waste_name)}&suggestion=${encodeURIComponent(match.suggestion)}`)}
                                    >
                                        Act Now <span aria-hidden="true">→</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-zinc-500">
                        No direct matches with your current waste streams found in this article.
                    </div>
                )}
            </div>
        </div>
    );
}
