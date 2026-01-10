import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 bg-zinc-50 dark:bg-zinc-900">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
