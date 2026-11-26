import { Container } from "@/components/ui/container";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-ink">
        <Container>
          <div className="h-4 w-32 rounded bg-forest-800 animate-pulse mb-4" />
          <div className="h-12 w-full max-w-xl rounded-xl bg-forest-800 animate-pulse mb-4" />
          <div className="h-5 w-full max-w-md rounded bg-forest-800/80 animate-pulse" />
        </Container>
      </section>

      <section className="py-6 bg-cream">
        <Container>
          <div className="h-11 w-full rounded-xl bg-white border border-forest-100 animate-pulse mb-4" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-9 w-28 rounded-full bg-forest-100 animate-pulse"
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 bg-cream">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-forest-100 overflow-hidden"
              >
                <div className="aspect-video bg-forest-100 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-5 w-4/5 rounded bg-forest-100 animate-pulse" />
                  <div className="h-4 w-full rounded bg-forest-50 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-forest-50 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
