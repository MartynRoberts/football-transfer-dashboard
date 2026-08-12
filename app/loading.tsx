export default function Loading() {
  return (
    <main
      className="app-page page-stack"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="route-loading-bar" aria-hidden="true" />

      <div className="flex items-center gap-3" role="status">
        <span className="route-loading-spinner" aria-hidden="true" />
        <span className="font-medium text-slate-600">Loading page…</span>
      </div>

      <div className="space-y-4" aria-hidden="true">
        <div className="h-9 w-64 max-w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded bg-slate-100"
            />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded bg-slate-100" />
      </div>
    </main>
  );
}
