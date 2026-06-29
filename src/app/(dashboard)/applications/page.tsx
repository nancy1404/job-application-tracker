import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function ApplicationsPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Applications"
        description="Manage every job application from one workspace."
      />

      <EmptyState
        title="No applications yet"
        description="Start by adding your first application to track status and notes."
      />
    </DashboardShell>
  );
}
