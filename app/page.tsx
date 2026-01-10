import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="space-y-4 max-w-2xl flex flex-col items-center">
          <Image
            src="/regenx_logo.png"
            alt="ReGenX Logo"
            width={300}
            height={300}
            priority
            className="mb-4"
          />
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            One industry's waste is another's raw material. <br />
            Join the circular economy revolution.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-green-600 px-8 py-3 text-white font-semibold hover:bg-green-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/marketplace"
            className="rounded-full border border-zinc-200 dark:border-zinc-800 px-8 py-3 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            Browse Marketplace
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left max-w-4xl w-full">
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="text-lg font-bold mb-2">AI Matchmaking</h3>
            <p className="text-zinc-500 text-sm">Our agents analyze your waste output and find the perfect buyers instantly.</p>
          </div>
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="text-lg font-bold mb-2">Workflow Parsing</h3>
            <p className="text-zinc-500 text-sm">Upload your process diagrams or descriptions to identify hidden revenue streams.</p>
          </div>
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="text-lg font-bold mb-2">Global Insights</h3>
            <p className="text-zinc-500 text-sm">Stay ahead with real-time news and regulatory updates on industrial sustainability.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
