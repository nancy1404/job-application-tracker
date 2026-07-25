import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/theme-toggle';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/applications', label: 'Applications' },
  { href: '/resumes', label: 'Resumes' },
  { href: '/reminders', label: 'Reminders' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:w-56 lg:border-b-0 lg:border-r">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Job Tracker</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI match insights</p>
          </div>

          <div className="mb-4">
            <ThemeToggle />
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
