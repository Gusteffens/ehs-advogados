import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getAnalyticsOverview } from "@/lib/analytics/queries";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import AnalyticsLoading from "./loading";

export const dynamic = "force-dynamic";

async function AnalyticsOverviewLoader() {
  const initialData = await getAnalyticsOverview("30d");
  return <AnalyticsDashboard initialData={initialData} />;
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  return (
    <div className="max-w-7xl mx-auto">
      <Suspense fallback={<AnalyticsLoading />}>
        <AnalyticsOverviewLoader />
      </Suspense>
    </div>
  );
}
