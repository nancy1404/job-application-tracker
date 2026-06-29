import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function RemindersPage() {
  return (
    <DashboardShell>
      <PageHeader title="Reminders" description="Stay on top of follow-ups and deadlines." />

      <EmptyState
        title="No reminders yet"
        description="Create reminders for applications that need your attention next."
      />
    </DashboardShell>
  );
}
