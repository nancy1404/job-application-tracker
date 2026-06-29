import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function DashboardPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Dashboard"
        description="Track your applications and upcoming reminders in one place."
      />

      <EmptyState
        title="Your dashboard is ready"
        description="Add applications, resumes, and reminders to start seeing your progress here."
      />
    </DashboardShell>
  );
}
