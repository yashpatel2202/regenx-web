/**
 * @fileoverview Global News Feed Page
 * @description Fetches real-time industrial sustainability news from Google News RSS.
 * Filters for keywords like Innovation, Regulation, and Market trends.
 * Implements runtime fetching without scheduled tasks.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FeedPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch news at runtime on mount
        fetch("/api/news")
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
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Public Resource Insights</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Real-time industry news & AI analysis.</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="pl-8 pb-8 border-l border-zinc-200 dark:border-zinc-800 relative animate-pulse">
                            <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            <div className="p-4 -mt-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl space-y-3">
                                <div className="flex gap-2">
                                    <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                </div>
                                <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                                <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {news.map((item) => (
                        <div key={item.id} className="group relative pl-8 pb-8 border-l border-zinc-200 dark:border-zinc-800 last:pb-0">
                            <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-black" />
                            <Link href={`/feed/${item.id}`} className="block">
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-4 -mt-4 rounded-xl transition-colors cursor-pointer">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.category === 'Innovation' ? 'bg-purple-100 text-purple-800' :
                                                item.category === 'Regulation' ? 'bg-amber-100 text-amber-800' :
                                                    item.category === 'Market' ? 'bg-green-100 text-green-800' :
                                                        item.category === 'Hazard' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                }`}>
                                                {item.category}
                                            </span>
                                            <span className="text-xs text-zinc-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-bold group-hover:text-green-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                                            {item.summary}
                                        </p>
                                        <div className="pt-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
                                            <span>Read Analysis →</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
