"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/orders?type=${activeTab}&companyId=${user.companyId}`);
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                // Update UI immediately
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    if (!user) return null;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Order Management</h1>
            <p className="text-zinc-500 mb-8">Track your purchases and manage incoming requests.</p>

            <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
                <button
                    onClick={() => setActiveTab('buying')}
                    className={`pb-3 px-1 mr-6 font-medium text-sm transition-colors relative ${activeTab === 'buying'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                >
                    My Orders
                </button>
                <button
                    onClick={() => setActiveTab('selling')}
                    className={`pb-3 px-1 font-medium text-sm transition-colors relative ${activeTab === 'selling'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                >
                    Incoming Requests (Asked)
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-zinc-500">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    No orders found in this section.
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{order.listing_title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-sm text-zinc-500">
                                    {activeTab === 'buying' ? (
                                        <>Seller: <span className="font-medium text-zinc-700 dark:text-zinc-300">{order.seller_name}</span></>
                                    ) : (
                                        <>Buyer: <span className="font-medium text-zinc-700 dark:text-zinc-300">{order.buyer_name}</span></>
                                    )}
                                    <span className="mx-2">•</span>
                                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end min-w-[150px]">
                                <div className="font-bold text-lg">{order.quantity} {order.unit || 'Units'}</div>
                                <div className="text-sm text-zinc-500">Total: ${Number(order.total_price).toLocaleString()}</div>
                            </div>

                            {activeTab === 'selling' && order.status === 'PENDING' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'APPROVED')}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'REJECTED')}
                                        className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-200 transition"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
