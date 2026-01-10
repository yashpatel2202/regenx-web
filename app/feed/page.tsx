"use client";

import { useEffect, useState } from "react";

export default function FeedPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/agents/news")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setNews(data.feed);
                }
            })
            .catch((err) => console.error("Failed to load feed", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Public Resource Insights</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Latest news and innovations in waste utilization.</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-zinc-500">Loading insights...</div>
            ) : (
                <div className="space-y-6">
                    {news.map((item) => (
                        <div key={item.id} className="group relative pl-8 pb-8 border-l border-zinc-200 dark:border-zinc-800 last:pb-0">
                            <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-black" />
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-4 -mt-4 rounded-xl transition-colors">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                            {item.category}
                                        </span>
                                        <span className="text-xs text-zinc-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold group-hover:text-green-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                        {item.summary}
                                    </p>
                                    <div className="pt-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
                                        <span>Source: {item.source}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
