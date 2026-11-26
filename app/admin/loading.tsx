export default function AdminLoading() {
  return (
    <div className="max-w-6xl mx-auto pt-28 lg:pt-0 space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-xl bg-forest-100 animate-pulse" />
        <div className="h-4 w-72 rounded bg-forest-100/70 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white border border-forest-100 p-5 space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-cream animate-pulse" />
            <div className="h-7 w-16 rounded bg-forest-100 animate-pulse" />
            <div className="h-3 w-32 rounded bg-forest-50 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-forest-100 p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="h-12 w-full rounded-xl bg-cream/70 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
