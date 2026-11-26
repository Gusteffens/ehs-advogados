import { Container } from "@/components/ui/container";

export default function BlogArticleLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-24 bg-ink">
        <Container>
          <div className="h-4 w-48 rounded bg-forest-800 animate-pulse mb-8" />
          <div className="h-6 w-28 rounded-full bg-forest-800 animate-pulse mb-5" />
          <div className="h-12 w-full max-w-2xl rounded-xl bg-forest-800 animate-pulse mb-4" />
          <div className="h-10 w-3/4 max-w-xl rounded-xl bg-forest-800 animate-pulse mb-8" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-forest-800 animate-pulse" />
            <div className="h-4 w-40 rounded bg-forest-800 animate-pulse" />
          </div>
        </Container>
      </section>

      <section className="py-12 bg-cream">
        <Container>
          <div className="max-w-4xl mx-auto aspect-video rounded-2xl bg-forest-100 animate-pulse mb-12" />
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="h-4 w-full rounded bg-forest-100 animate-pulse" />
            <div className="h-4 w-11/12 rounded bg-forest-100 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-forest-100 animate-pulse" />
            <div className="h-7 w-2/3 rounded bg-forest-100 animate-pulse mt-8" />
            <div className="h-4 w-full rounded bg-forest-100 animate-pulse" />
            <div className="h-4 w-4/5 rounded bg-forest-100 animate-pulse" />
          </div>
        </Container>
      </section>
    </div>
  );
}
