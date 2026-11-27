export default function LeadsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-champagne-200/80 animate-pulse" />
        <div className="h-8 w-48 rounded-xl bg-forest-100 animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded bg-forest-100/70 animate-pulse" />
      </div>

      {/* Status Tabs + Search */}
      <div className="rounded-2xl bg-white border border-forest-100 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-xl bg-cream-light animate-pulse" />
          <div className="h-9 w-24 rounded-xl bg-cream-light animate-pulse" />
          <div className="h-9 w-28 rounded-xl bg-cream-light animate-pulse" />
        </div>
        <div className="h-9 w-full sm:w-64 rounded-xl bg-cream-light animate-pulse" />
      </div>

      {/* Lead Rows */}
      <div className="rounded-2xl bg-white border border-forest-100 p-5 shadow-xs space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-cream-light/85 p-4 space-y-2.5 animate-pulse"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="h-4 w-44 rounded bg-forest-100" />
              <div className="h-5 w-20 rounded-md bg-forest-100/80" />
            </div>
            <div className="h-3.5 w-3/4 max-w-lg rounded bg-forest-100/70" />
            <div className="flex items-center gap-3 pt-1">
              <div className="h-3 w-36 rounded bg-forest-100/60" />
              <div className="h-3 w-24 rounded bg-forest-100/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
