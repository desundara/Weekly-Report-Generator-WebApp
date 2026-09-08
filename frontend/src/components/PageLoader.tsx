export function PageLoader({ message = "Loading…" }: { message?: string }) {
    return (
        <main className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 px-6 py-4 glass-panel">
            <span className="w-5 h-5 border-2 rounded-full border-accent-violet border-t-transparent animate-spin" />
            <span className="text-sm text-text-muted">{message}</span>
        </div>
        </main>
    );
}