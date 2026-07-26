'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Company = {
  id: string;
  name: string;
};

type Application = {
  id: string;
  title: string;
  status: string;
  opportunityType?: string | null;
  outcome?: string | null;
  createdAt?: string;
  appliedDate?: string | null;
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

type SessionUser = {
  name?: string | null;
  email?: string | null;
};

const statusOptions = [
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'SAVED', label: 'Saved' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
];

const opportunityTypeBuckets = [
  { key: 'JOB', label: 'Jobs' },
  { key: 'INTERNSHIP', label: 'Internships' },
  { key: 'RESEARCH', label: 'Research / Lab' },
  { key: 'OTHER_OUTREACH', label: 'Other Outreach' },
];

const outcomeOptions = ['ACTIVE', 'ACCEPTED', 'REJECTED', 'NO_RESPONSE', 'WITHDRAWN', 'ARCHIVED'];

function getOpportunityTypeBucket(value?: string | null) {
  switch (value) {
    case 'JOB':
      return 'JOB';
    case 'INTERNSHIP':
      return 'INTERNSHIP';
    case 'RESEARCH':
    case 'LAB':
      return 'RESEARCH';
    case 'PROFESSOR_OUTREACH':
    case 'OTHER_OUTREACH':
      return 'OTHER_OUTREACH';
    default:
      return 'JOB';
  }
}

function getOpportunityTypeLabel(value?: string | null) {
  switch (getOpportunityTypeBucket(value)) {
    case 'JOB':
      return 'Job';
    case 'INTERNSHIP':
      return 'Internship';
    case 'RESEARCH':
      return 'Research / Lab';
    case 'OTHER_OUTREACH':
      return 'Other Outreach';
    default:
      return 'Job';
  }
}

function getOutcomeLabel(value?: string | null) {
  switch (value) {
    case 'ACCEPTED':
      return 'Accepted';
    case 'REJECTED':
      return 'Rejected';
    case 'NO_RESPONSE':
      return 'No Response';
    case 'WITHDRAWN':
      return 'Withdrawn';
    case 'ARCHIVED':
      return 'Archived';
    case 'ACTIVE':
    default:
      return 'Active';
  }
}

function isActiveOutcome(value?: string | null) {
  return !value || value === 'ACTIVE';
}

function formatDate(value?: string) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleDateString();
}

function formatDateTime(value?: string) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function toValidDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function isWithinRange(value: Date | null, start: Date, end: Date) {
  if (!value) {
    return false;
  }

  return value >= start && value <= end;
}

function getPercent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / total) * 100));
}

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setLoadError('');

      try {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = (await sessionResponse.json().catch(() => null)) as
          | { user?: SessionUser | null }
          | null;

        if (!sessionData?.user) {
          setAuthStatus('unauthenticated');
          router.replace('/auth/signin');
          return;
        }

        setSessionUser(sessionData.user);
        setAuthStatus('authenticated');

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
  }, [router]);

  const applicationsByStatus = statusOptions.reduce<Record<string, number>>((counts, statusOption) => {
    counts[statusOption.value] = applications.filter((application) => application.status === statusOption.value).length;
    return counts;
  }, {});

  const opportunityTypeCounts = opportunityTypeBuckets.reduce<Record<string, number>>((counts, bucket) => {
    counts[bucket.key] = applications.filter((application) => getOpportunityTypeBucket(application.opportunityType) === bucket.key).length;
    return counts;
  }, {});

  const outcomeCounts = outcomeOptions.reduce<Record<string, number>>((counts, outcome) => {
    counts[outcome] = applications.filter((application) => (application.outcome ?? 'ACTIVE') === outcome).length;
    return counts;
  }, {});

  const defaultResume = resumes.find((resume) => resume.isDefault);
  const pendingReminders = reminders.filter((reminder) => reminder.status === 'PENDING');
  const now = new Date();
  const weekStart = new Date(now);
  const dayIndex = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - dayIndex);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  function getProgressMetrics(periodStart: Date) {
    const opportunitiesAdded = applications.filter((application) =>
      isWithinRange(toValidDate(application.createdAt), periodStart, now)
    );

    const applicationsSubmitted = applications.filter((application) =>
      isWithinRange(toValidDate(application.appliedDate ?? undefined), periodStart, now)
    );

    const interviewsInRange = opportunitiesAdded.filter((application) => application.status === 'INTERVIEW').length;
    const offersInRange = opportunitiesAdded.filter((application) => application.status === 'OFFER').length;

    const followUpsDue = reminders.filter(
      (reminder) =>
        reminder.status === 'PENDING' && isWithinRange(toValidDate(reminder.dueDate), periodStart, now)
    ).length;

    const followUpsCompleted = reminders.filter(
      (reminder) =>
        reminder.status === 'COMPLETED' && isWithinRange(toValidDate(reminder.dueDate), periodStart, now)
    ).length;

    const submissionPercent = opportunitiesAdded.length
      ? Math.min(100, Math.round((applicationsSubmitted.length / opportunitiesAdded.length) * 100))
      : 0;

    const followUpTotal = followUpsDue + followUpsCompleted;
    const followUpCompletionPercent = followUpTotal
      ? Math.min(100, Math.round((followUpsCompleted / followUpTotal) * 100))
      : 0;

    return {
      opportunitiesAdded: opportunitiesAdded.length,
      applicationsSubmitted: applicationsSubmitted.length,
      interviewsInRange,
      offersInRange,
      followUpsDue,
      followUpsCompleted,
      submissionPercent,
      followUpCompletionPercent,
    };
  }

  const weeklyProgress = getProgressMetrics(weekStart);
  const monthlyProgress = getProgressMetrics(monthStart);
  const weeklyScaleMax = Math.max(
    1,
    weeklyProgress.opportunitiesAdded,
    weeklyProgress.applicationsSubmitted,
    weeklyProgress.interviewsInRange,
    weeklyProgress.offersInRange,
    weeklyProgress.followUpsDue,
    weeklyProgress.followUpsCompleted
  );
  const monthlyScaleMax = Math.max(
    1,
    monthlyProgress.opportunitiesAdded,
    monthlyProgress.applicationsSubmitted,
    monthlyProgress.interviewsInRange,
    monthlyProgress.offersInRange,
    monthlyProgress.followUpsDue,
    monthlyProgress.followUpsCompleted
  );
  const hasProgressData =
    weeklyProgress.opportunitiesAdded +
      weeklyProgress.applicationsSubmitted +
      weeklyProgress.followUpsDue +
      weeklyProgress.followUpsCompleted +
      monthlyProgress.opportunitiesAdded +
      monthlyProgress.applicationsSubmitted +
      monthlyProgress.followUpsDue +
      monthlyProgress.followUpsCompleted >
    0;

  const overdueReminders = reminders
    .filter((reminder) => reminder.status === 'PENDING' && new Date(reminder.dueDate) < now)
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime());
  const upcomingReminders = reminders
    .filter((reminder) => reminder.status === 'PENDING' && new Date(reminder.dueDate) >= now)
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())
    .slice(0, 3);

  const recentApplications = [...applications]
    .sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

      return rightTime - leftTime;
    })
    .slice(0, 3);

  const greetingTarget = sessionUser?.name?.trim() || sessionUser?.email?.trim() || 'Welcome back';
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {authStatus === 'loading' ? (
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Loading dashboard...</p>
        ) : null}

        <header className="mb-8">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Hello, {greetingTarget}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{todayLabel}</p>
          <p className="mt-2 max-w-xl text-xs italic text-slate-500 dark:text-slate-400">
            "It always seems impossible until it&apos;s done."
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Here’s your opportunity activity for today.</p>
        </header>

        {isLoading ? <p className="text-sm text-slate-600 dark:text-slate-300">Loading dashboard...</p> : null}
        {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}

        {!isLoading && !loadError ? (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total opportunities</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{applications.length}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Status summary (current stage)</p>
                <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                  {statusOptions.map((statusOption) => (
                    <div key={statusOption.value} className="flex items-center justify-between gap-3">
                      <span>{statusOption.label}</span>
                      <span>{applicationsByStatus[statusOption.value] ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total resumes</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{resumes.length}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Default resume: {defaultResume ? defaultResume.title : 'None'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending reminders</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{pendingReminders.length}</p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/40">
                <p className="text-sm text-rose-700 dark:text-rose-300">Overdue reminders</p>
                <p className="mt-2 text-3xl font-semibold text-rose-800 dark:text-rose-200">{overdueReminders.length}</p>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/40">
                <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming reminders</p>
                <p className="mt-2 text-3xl font-semibold text-sky-800 dark:text-sky-200">{upcomingReminders.length}</p>
              </div>
            </div>

            <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Progress</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">This week and this month</span>
              </div>

              {!hasProgressData ? (
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  Start adding opportunities to see your progress here.
                </p>
              ) : (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Opportunities added</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {weeklyProgress.opportunitiesAdded}
                        <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">week</span>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{monthlyProgress.opportunitiesAdded} this month</p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Applications submitted</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {weeklyProgress.applicationsSubmitted}
                        <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">week</span>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{monthlyProgress.applicationsSubmitted} this month</p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Follow-ups due</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {weeklyProgress.followUpsDue}
                        <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">week</span>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{monthlyProgress.followUpsDue} this month</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">This week</h3>
                      <div className="mt-3 space-y-3">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Opportunities added</span>
                            <span>{weeklyProgress.opportunitiesAdded}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-slate-900 dark:bg-slate-300" style={{ width: `${getPercent(weeklyProgress.opportunitiesAdded, weeklyScaleMax)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Applications submitted</span>
                            <span>{weeklyProgress.applicationsSubmitted}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-sky-500 dark:bg-sky-400" style={{ width: `${getPercent(weeklyProgress.applicationsSubmitted, weeklyScaleMax)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Follow-ups due</span>
                            <span>{weeklyProgress.followUpsDue}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-amber-500 dark:bg-amber-400" style={{ width: `${getPercent(weeklyProgress.followUpsDue, weeklyScaleMax)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Follow-ups completed</span>
                            <span>{weeklyProgress.followUpsCompleted}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${getPercent(weeklyProgress.followUpsCompleted, weeklyScaleMax)}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        Submission momentum: {weeklyProgress.submissionPercent}% of this week&apos;s added opportunities were submitted.
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">This month</h3>
                      <div className="mt-3 space-y-3">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Opportunities added</span>
                            <span>{monthlyProgress.opportunitiesAdded}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-slate-900 dark:bg-slate-300" style={{ width: `${getPercent(monthlyProgress.opportunitiesAdded, monthlyScaleMax)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Applications submitted</span>
                            <span>{monthlyProgress.applicationsSubmitted}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-sky-500 dark:bg-sky-400" style={{ width: `${getPercent(monthlyProgress.applicationsSubmitted, monthlyScaleMax)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Interviews (added this month)</span>
                            <span>{monthlyProgress.interviewsInRange}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-violet-500 dark:bg-violet-400" style={{ width: `${getPercent(monthlyProgress.interviewsInRange, monthlyScaleMax)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Offers (added this month)</span>
                            <span>{monthlyProgress.offersInRange}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-2 rounded-full bg-fuchsia-500 dark:bg-fuchsia-400" style={{ width: `${getPercent(monthlyProgress.offersInRange, monthlyScaleMax)}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        Follow-up completion: {monthlyProgress.followUpCompletionPercent}% of due follow-ups this month are completed.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>

            <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Opportunity breakdown</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">Simplified view</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {opportunityTypeBuckets.map((bucket) => (
                  <div key={bucket.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-300">{bucket.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{opportunityTypeCounts[bucket.key] ?? 0}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Outcome summary (final result)</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">Final result and archive state</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {outcomeOptions.map((outcome) => (
                  <div key={outcome} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-300">{getOutcomeLabel(outcome)}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{outcomeCounts[outcome] ?? 0}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Reminder urgency</h2>
                <Link href="/reminders" className="text-sm font-medium text-slate-900 underline dark:text-slate-100">
                  Open reminders
                </Link>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/40">
                  <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-200">Overdue</h3>
                  {overdueReminders.length === 0 ? (
                    <p className="mt-2 text-sm text-rose-700/90 dark:text-rose-200/90">No overdue reminders.</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {overdueReminders.slice(0, 3).map((reminder) => (
                        <article key={reminder.id} className="rounded-md border border-rose-200/80 bg-white/70 p-3 dark:border-rose-900/60 dark:bg-rose-950/30">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{reminder.title}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">Due {formatDateTime(reminder.dueDate)}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/40">
                  <h3 className="text-sm font-semibold text-sky-800 dark:text-sky-200">Upcoming</h3>
                  {upcomingReminders.length === 0 ? (
                    <p className="mt-2 text-sm text-sky-700/90 dark:text-sky-200/90">No upcoming reminders.</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {upcomingReminders.map((reminder) => (
                        <article key={reminder.id} className="rounded-md border border-sky-200/80 bg-white/70 p-3 dark:border-sky-900/60 dark:bg-sky-950/30">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{reminder.title}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">Due {formatDateTime(reminder.dueDate)}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent opportunities</h2>
                  <Link href="/applications" className="text-sm font-medium text-slate-900 underline dark:text-slate-100">
                    View all
                  </Link>
                </div>

                {recentApplications.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No opportunities yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {recentApplications.map((application) => (
                      <article key={application.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{application.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {application.company?.name ?? 'No company'} · {application.status}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {getOpportunityTypeLabel(application.opportunityType)}
                          {!isActiveOutcome(application.outcome) ? ` · ${getOutcomeLabel(application.outcome)}` : ''}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Created {formatDate(application.createdAt)}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Upcoming reminders</h2>
                  <Link href="/reminders" className="text-sm font-medium text-slate-900 underline dark:text-slate-100">
                    View all
                  </Link>
                </div>

                {upcomingReminders.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No upcoming reminders.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {upcomingReminders.map((reminder) => (
                      <article key={reminder.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{reminder.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Due {formatDate(reminder.dueDate)}</p>
                        {reminder.application ? (
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
