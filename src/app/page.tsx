import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
        <section className="w-full rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Job Application Tracker</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Keep your job search organized by tracking applications and outreach, managing resumes, and
            setting reminders.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full rounded-lg bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="block w-full rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Create Account
            </Link>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-slate-700">
            <li>Track applications</li>
            <li>Manage resumes</li>
            <li>Set reminders</li>
          </ul>

          <p className="mt-5 text-xs text-slate-500">Optional AI match insights are available after sign-in.</p>
        </section>
      </div>
    </main>
  );
}
