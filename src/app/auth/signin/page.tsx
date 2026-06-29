import { PageHeader } from '@/components/layout/page-header';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <PageHeader title="Sign in" description="Use your credentials to continue." />
        <p className="text-sm text-slate-600">Authentication will be wired in next.</p>
      </div>
    </div>
  );
}
