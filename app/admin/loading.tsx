export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-2.5">
        <div className="h-3 w-28 rounded bg-champagne-200/80 animate-pulse" />
        <div className="h-8 w-64 rounded-xl bg-forest-100 animate-pulse" />
        <div className="h-4 w-80 max-w-full rounded bg-forest-100/70 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white border border-forest-200/70 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-forest-100 animate-pulse" />
              <div className="h-9 w-9 rounded-xl bg-cream animate-pulse" />
            </div>
            <div className="h-8 w-20 rounded bg-forest-100 animate-pulse" />
            <div className="h-3 w-36 rounded bg-forest-50 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-forest-200/70 p-6 space-y-3">
          <div className="h-5 w-44 rounded bg-forest-100 animate-pulse mb-4" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-12 w-full rounded-xl bg-cream/70 animate-pulse"
            />
          ))}
        </div>
        <div className="rounded-2xl bg-white border border-forest-200/70 p-6 space-y-3">
          <div className="h-5 w-36 rounded bg-forest-100 animate-pulse mb-4" />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-14 w-full rounded-xl bg-cream/70 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
