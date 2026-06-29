'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Company = {
  id: string;
  name: string;
};

type Application = {
  id: string;
  title: string;
  status: string;
  createdAt?: string;
  company?: Company | null;
};

type Resume = {
  id: string;
  title: string;
  isDefault: boolean;
  createdAt?: string;
};

type Reminder = {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  application?: {
    id: string;
    title: string;
    company?: Company | null;
  } | null;
};

const statusOptions = ['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED'];

function formatDate(value?: string) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleDateString();
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setLoadError('');

      try {
        const [applicationsResponse, resumesResponse, remindersResponse] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/resumes'),
          fetch('/api/reminders'),
        ]);

        if (!applicationsResponse.ok) {
          throw new Error('Failed to load applications.');
        }

        if (!resumesResponse.ok) {
          throw new Error('Failed to load resumes.');
        }

        if (!remindersResponse.ok) {
          throw new Error('Failed to load reminders.');
        }

        const applicationsData = (await applicationsResponse.json()) as { applications: Application[] };
        const resumesData = (await resumesResponse.json()) as { resumes: Resume[] };
        const remindersData = (await remindersResponse.json()) as { reminders: Reminder[] };

        setApplications(applicationsData.applications ?? []);
        setResumes(resumesData.resumes ?? []);
        setReminders(remindersData.reminders ?? []);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  const applicationsByStatus = statusOptions.reduce<Record<string, number>>((counts, status) => {
    counts[status] = applications.filter((application) => application.status === status).length;
    return counts;
  }, {});

  const defaultResume = resumes.find((resume) => resume.isDefault);
  const pendingReminders = reminders.filter((reminder) => reminder.status === 'PENDING');
  const upcomingReminders = reminders
    .filter((reminder) => reminder.status === 'PENDING' && new Date(reminder.dueDate) >= new Date())
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())
    .slice(0, 3);

  const recentApplications = [...applications]
    .sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

      return rightTime - leftTime;
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Track your applications, resumes, and reminders in one place.</p>
        </header>

        {isLoading ? <p className="text-sm text-slate-600">Loading dashboard...</p> : null}
        {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}

        {!isLoading && !loadError ? (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total applications</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{applications.length}</p>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Applications by status</p>
                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  {statusOptions.map((status) => (
                    <div key={status} className="flex items-center justify-between gap-3">
                      <span>{status}</span>
                      <span>{applicationsByStatus[status] ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total resumes</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{resumes.length}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Default resume: {defaultResume ? defaultResume.title : 'None'}
                </p>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Pending reminders</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{pendingReminders.length}</p>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Upcoming reminders</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{upcomingReminders.length}</p>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Quick links</p>
                <div className="mt-3 flex flex-col gap-2 text-sm font-medium text-slate-900">
                  <Link href="/applications" className="underline">
                    Applications
                  </Link>
                  <Link href="/resumes" className="underline">
                    Resumes
                  </Link>
                  <Link href="/reminders" className="underline">
                    Reminders
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-900">Recent applications</h2>
                  <Link href="/applications" className="text-sm font-medium text-slate-900 underline">
                    View all
                  </Link>
                </div>

                {recentApplications.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">No applications yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {recentApplications.map((application) => (
                      <article key={application.id} className="rounded-lg border border-slate-200 p-4">
                        <h3 className="font-medium text-slate-900">{application.title}</h3>
                        <p className="text-sm text-slate-600">
                          {application.company?.name ?? 'No company'} · {application.status}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">Created {formatDate(application.createdAt)}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-900">Upcoming reminders</h2>
                  <Link href="/reminders" className="text-sm font-medium text-slate-900 underline">
                    View all
                  </Link>
                </div>

                {upcomingReminders.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">No upcoming reminders.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {upcomingReminders.map((reminder) => (
                      <article key={reminder.id} className="rounded-lg border border-slate-200 p-4">
                        <h3 className="font-medium text-slate-900">{reminder.title}</h3>
                        <p className="text-sm text-slate-600">Due {formatDate(reminder.dueDate)}</p>
                        {reminder.application ? (
                          <p className="mt-1 text-sm text-slate-500">
                            Linked to {reminder.application.title}
                            {reminder.application.company?.name ? ` · ${reminder.application.company.name}` : ''}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
