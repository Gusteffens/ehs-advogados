export default function AnalyticsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* Header + Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-champagne-200/80 animate-pulse" />
          <div className="h-8 w-64 rounded-xl bg-forest-100 animate-pulse" />
          <div className="h-4 w-80 max-w-full rounded bg-forest-100/70 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 rounded-xl bg-white border border-forest-100 animate-pulse" />
          <div className="h-9 w-20 rounded-xl bg-white border border-forest-100 animate-pulse" />
          <div className="h-9 w-20 rounded-xl bg-white border border-forest-100 animate-pulse" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white border border-forest-100 p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-forest-100 animate-pulse" />
              <div className="h-9 w-9 rounded-xl bg-cream-light animate-pulse" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-forest-100 animate-pulse" />
            <div className="h-3 w-36 rounded bg-cream-light animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="rounded-2xl bg-white border border-forest-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 rounded bg-forest-100 animate-pulse" />
          <div className="h-4 w-28 rounded bg-cream-light animate-pulse" />
        </div>
        <div className="h-56 w-full rounded-xl bg-cream-light/90 animate-pulse" />
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, cardIdx) => (
          <div
            key={cardIdx}
            className="rounded-2xl bg-white border border-forest-100 p-6 shadow-xs space-y-3"
          >
            <div className="h-5 w-44 rounded bg-forest-100 animate-pulse mb-2" />
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="h-11 w-full rounded-xl bg-cream-light/80 animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
