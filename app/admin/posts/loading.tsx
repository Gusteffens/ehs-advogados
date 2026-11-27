export default function PostsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-xl bg-forest-100 animate-pulse" />
          <div className="h-4 w-72 max-w-full rounded bg-forest-100/70 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-forest-100 animate-pulse" />
      </div>

      {/* Filter / Search Bar */}
      <div className="rounded-2xl bg-white border border-forest-100 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 rounded-xl bg-cream-light animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-xl bg-cream-light animate-pulse" />
          <div className="h-10 w-32 rounded-xl bg-cream-light animate-pulse" />
        </div>
      </div>

      {/* Posts List Card */}
      <div className="rounded-2xl bg-white border border-forest-100 p-5 shadow-xs space-y-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 rounded-xl bg-cream-light/80 px-4 py-3.5 animate-pulse"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="h-11 w-16 shrink-0 rounded-lg bg-forest-100/80" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-2/3 max-w-md rounded bg-forest-100" />
                <div className="h-3 w-44 rounded bg-forest-100/60" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="h-6 w-20 rounded-lg bg-forest-100/80" />
              <div className="h-8 w-8 rounded-lg bg-forest-100/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
