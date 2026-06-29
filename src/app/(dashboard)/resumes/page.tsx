import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function ResumesPage() {
  return (
    <DashboardShell>
      <PageHeader title="Resumes" description="Keep multiple resume versions ready for matching." />

      <EmptyState
        title="No resumes yet"
        description="Upload or paste a resume to generate AI match insights later."
      />
    </DashboardShell>
  );
}
