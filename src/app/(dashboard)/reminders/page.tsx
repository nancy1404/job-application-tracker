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

function formatDateForInput(value?: string | null) {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString().slice(0, 10);
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
    setDueDate(formatDateForInput(reminder.dueDate));
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
      const response = await fetch(isEditing ? `/api/reminders/${editingReminderId}` : '/api/reminders', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          dueDate: new Date(dueDate).toISOString(),
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reminders</h1>
          <p className="mt-2 text-sm text-slate-600">Stay on top of follow-ups and deadlines.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{editingReminderId ? 'Edit reminder' : 'New reminder'}</h2>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="dueDate">
                    Due date
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="applicationId">
                  Application (optional)
                </label>
                <select
                  id="applicationId"
                  value={applicationId}
                  onChange={(event) => setApplicationId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Your reminders</h2>
              <span className="text-sm text-slate-500">{reminders.length} total</span>
            </div>

            {isLoading ? <p className="mt-4 text-sm text-slate-600">Loading reminders...</p> : null}
            {loadError ? <p className="mt-4 text-sm text-red-600">{loadError}</p> : null}

            {!isLoading && !loadError && reminders.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No reminders yet.</p>
            ) : null}

            <div className="mt-4 space-y-3">
              {reminders.map((reminder) => (
                <article key={reminder.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-slate-900">{reminder.title}</h3>
                      <p className="text-sm text-slate-600">
                        Due {new Date(reminder.dueDate).toLocaleDateString()} · {reminder.status}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(reminder)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteReminder(reminder.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {reminder.application ? (
                    <p className="mt-3 text-sm text-slate-600">
                      Linked to {reminder.application.title}
                      {reminder.application.company?.name ? ` · ${reminder.application.company.name}` : ''}
                    </p>
                  ) : null}

                  {reminder.notes ? <p className="mt-2 text-sm text-slate-600">{reminder.notes}</p> : null}
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
