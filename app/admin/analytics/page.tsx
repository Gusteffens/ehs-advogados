import { requireAdmin } from "@/lib/auth";
import { getAnalyticsOverview } from "@/lib/analytics/queries";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const initialData = await getAnalyticsOverview("30d");

  return (
    <div className="max-w-7xl mx-auto">
      <AnalyticsDashboard initialData={initialData} />
    </div>
  );
}
