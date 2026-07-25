'use client';

import { useEffect, useState, type FormEvent } from 'react';

type Company = {
  id: string;
  name: string;
};

type Application = {
  id: string;
  title: string;
  company?: Company | null;
};

type Reminder = {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  notes?: string | null;
  application?: Application | null;
};

const statusOptions = ['PENDING', 'COMPLETED'];

type ReminderTiming = 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING' | 'COMPLETED';

function formatDateTimeForInput(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatReminderDateTime(value?: string | null) {
  if (!value) {
    return 'Invalid date';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getReminderTiming(reminder: Reminder, now: Date) {
  if (reminder.status === 'COMPLETED') {
    return 'COMPLETED' as const;
  }

  const due = new Date(reminder.dueDate);
  if (Number.isNaN(due.getTime())) {
    return 'UPCOMING' as const;
  }

  if (due < now) {
    return 'OVERDUE' as const;
  }

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  if (due >= startOfToday && due <= endOfToday) {
    return 'DUE_TODAY' as const;
  }

  return 'UPCOMING' as const;
}

function getTimingBadgeClasses(timing: ReminderTiming) {
  switch (timing) {
    case 'OVERDUE':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
    case 'DUE_TODAY':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'UPCOMING':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
}

function getTimingLabel(timing: ReminderTiming) {
  switch (timing) {
    case 'OVERDUE':
      return 'Overdue';
    case 'DUE_TODAY':
      return 'Due today';
    case 'UPCOMING':
      return 'Upcoming';
    case 'COMPLETED':
      return 'Completed';
    default:
      return 'Upcoming';
  }
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [editingReminderId, setEditingReminderId] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [notes, setNotes] = useState('');
  const [applicationId, setApplicationId] = useState('');

  async function loadData() {
    setIsLoading(true);
    setLoadError('');

    try {
      const [remindersResponse, applicationsResponse] = await Promise.all([
        fetch('/api/reminders'),
        fetch('/api/applications'),
      ]);

      if (!remindersResponse.ok) {
        throw new Error('Failed to load reminders.');
      }

      if (!applicationsResponse.ok) {
        throw new Error('Failed to load applications.');
      }

      const remindersData = (await remindersResponse.json()) as { reminders: Reminder[] };
      const applicationsData = (await applicationsResponse.json()) as { applications: Application[] };

      setReminders(remindersData.reminders ?? []);
      setApplications(applicationsData.applications ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load reminders.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function resetForm() {
    setEditingReminderId('');
    setTitle('');
    setDueDate('');
    setStatus('PENDING');
    setNotes('');
    setApplicationId('');
    setFormError('');
  }

  function startEdit(reminder: Reminder) {
    setEditingReminderId(reminder.id);
    setTitle(reminder.title);
    setDueDate(formatDateTimeForInput(reminder.dueDate));
    setStatus(reminder.status);
    setNotes(reminder.notes ?? '');
    setApplicationId(reminder.application?.id ?? '');
    setFormError('');
  }

  function cancelEdit() {
    resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const isEditing = Boolean(editingReminderId);
      const parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        throw new Error('Enter a valid reminder date and time.');
      }

      const response = await fetch(isEditing ? `/api/reminders/${editingReminderId}` : '/api/reminders', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          dueDate: parsedDueDate.toISOString(),
          status,
          notes,
          applicationId: applicationId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? 'Failed to save reminder.');
      }

      resetForm();
      await loadData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save reminder.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteReminder(reminderId: string) {
    const confirmed = window.confirm('Delete this reminder?');

    if (!confirmed) {
      return;
    }

    setLoadError('');

    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? 'Failed to delete reminder.');
      }

      if (editingReminderId === reminderId) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to delete reminder.');
    }
  }

  const now = new Date();
  const remindersByTiming = reminders.reduce<Record<ReminderTiming, Reminder[]>>(
    (accumulator, reminder) => {
      const timing = getReminderTiming(reminder, now);
      accumulator[timing].push(reminder);
      return accumulator;
    },
    {
      OVERDUE: [],
      DUE_TODAY: [],
      UPCOMING: [],
      COMPLETED: [],
    }
  );

  for (const key of Object.keys(remindersByTiming) as ReminderTiming[]) {
    remindersByTiming[key].sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime());
  }

  function renderReminderCard(reminder: Reminder) {
    const timing = getReminderTiming(reminder, now);

    return (
      <article key={reminder.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{reminder.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{formatReminderDateTime(reminder.dueDate)}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
              <span className={`rounded-full px-2.5 py-1 ${getTimingBadgeClasses(timing)}`}>{getTimingLabel(timing)}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {reminder.status}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => startEdit(reminder)}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => deleteReminder(reminder.id)}
              className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 dark:border-red-800 dark:text-red-300"
            >
              Delete
            </button>
          </div>
        </div>

        {reminder.application ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Linked to {reminder.application.title}
            {reminder.application.company?.name ? ` · ${reminder.application.company.name}` : ''}
          </p>
        ) : null}

        {reminder.notes ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{reminder.notes}</p> : null}
      </article>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Reminders</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Stay on top of follow-ups and deadlines.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{editingReminderId ? 'Edit reminder' : 'New reminder'}</h2>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="dueDate">
                    When to remind
                  </label>
                  <input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="applicationId">
                  Opportunity (optional)
                </label>
                <select
                  id="applicationId"
                  value={applicationId}
                  onChange={(event) => setApplicationId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">None</option>
                  {applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.title}{application.company?.name ? ` - ${application.company.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (editingReminderId ? 'Saving...' : 'Creating...') : editingReminderId ? 'Save changes' : 'Create reminder'}
                </button>

                {editingReminderId ? (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your reminders</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">{reminders.length} total</span>
            </div>

            {isLoading ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Loading reminders...</p> : null}
            {loadError ? <p className="mt-4 text-sm text-red-600">{loadError}</p> : null}

            {!isLoading && !loadError && reminders.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No reminders yet.</p>
            ) : null}

            <div className="mt-4 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Overdue</h3>
                {remindersByTiming.OVERDUE.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No overdue reminders.</p>
                ) : (
                  <div className="mt-3 space-y-3">{remindersByTiming.OVERDUE.map(renderReminderCard)}</div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Due today</h3>
                {remindersByTiming.DUE_TODAY.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No reminders due today.</p>
                ) : (
                  <div className="mt-3 space-y-3">{remindersByTiming.DUE_TODAY.map(renderReminderCard)}</div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upcoming</h3>
                {remindersByTiming.UPCOMING.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No upcoming reminders.</p>
                ) : (
                  <div className="mt-3 space-y-3">{remindersByTiming.UPCOMING.map(renderReminderCard)}</div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Completed</h3>
                {remindersByTiming.COMPLETED.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No completed reminders.</p>
                ) : (
                  <div className="mt-3 space-y-3">{remindersByTiming.COMPLETED.map(renderReminderCard)}</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
