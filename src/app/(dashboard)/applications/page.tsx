'use client';

import { useEffect, useState, type FormEvent } from 'react';

type Company = {
  id: string;
  name: string;
};

type Application = {
  id: string;
  title: string;
  jobUrl?: string | null;
  description?: string | null;
  status: string;
  appliedDate?: string | null;
  notes?: string | null;
  company?: Company | null;
};

const statusOptions = ['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED'];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('SAVED');
  const [appliedDate, setAppliedDate] = useState('');
  const [notes, setNotes] = useState('');

  async function loadData() {
    setIsLoading(true);
    setLoadError('');

    try {
      const [applicationsResponse, companiesResponse] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/companies'),
      ]);

      if (!applicationsResponse.ok) {
        throw new Error('Failed to load applications.');
      }

      if (!companiesResponse.ok) {
        throw new Error('Failed to load companies.');
      }

      const applicationsData = (await applicationsResponse.json()) as { applications: Application[] };
      const companiesData = (await companiesResponse.json()) as { companies: Company[] };

      setApplications(applicationsData.applications ?? []);
      setCompanies(companiesData.companies ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function getOrCreateCompanyId(name: string) {
    const normalizedName = name.trim().toLowerCase();
    const existingCompany = companies.find((company) => company.name.trim().toLowerCase() === normalizedName);

    if (existingCompany) {
      return existingCompany.id;
    }

    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        const refreshResponse = await fetch('/api/companies');
        if (refreshResponse.ok) {
          const refreshData = (await refreshResponse.json()) as { companies: Company[] };
          setCompanies(refreshData.companies ?? []);
          const refreshedCompany = refreshData.companies?.find(
            (company) => company.name.trim().toLowerCase() === normalizedName
          );

          if (refreshedCompany) {
            return refreshedCompany.id;
          }
        }
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error ?? 'Failed to create company.');
    }

    const data = (await response.json()) as { company: Company };
    setCompanies((currentCompanies) => [...currentCompanies, data.company]);
    return data.company.id;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      let companyId: string | undefined;

      if (companyName.trim()) {
        companyId = await getOrCreateCompanyId(companyName);
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          companyId,
          jobUrl,
          description,
          status,
          appliedDate: appliedDate ? new Date(appliedDate).toISOString() : undefined,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? 'Failed to create application.');
      }

      setTitle('');
      setCompanyName('');
      setJobUrl('');
      setDescription('');
      setStatus('SAVED');
      setAppliedDate('');
      setNotes('');

      await loadData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create application.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Applications</h1>
          <p className="mt-2 text-sm text-slate-600">Track your active job applications in one place.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">New application</h2>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
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

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="companyName">
                    Company name
                  </label>
                  <input
                    id="companyName"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="jobUrl">
                    Job URL
                  </label>
                  <input
                    id="jobUrl"
                    type="url"
                    value={jobUrl}
                    onChange={(event) => setJobUrl(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="appliedDate">
                    Applied date
                  </label>
                  <input
                    id="appliedDate"
                    type="date"
                    value={appliedDate}
                    onChange={(event) => setAppliedDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Creating...' : 'Create application'}
              </button>
            </form>
          </section>

          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Your applications</h2>
              <span className="text-sm text-slate-500">{applications.length} total</span>
            </div>

            {isLoading ? <p className="mt-4 text-sm text-slate-600">Loading applications...</p> : null}
            {loadError ? <p className="mt-4 text-sm text-red-600">{loadError}</p> : null}

            {!isLoading && !loadError && applications.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No applications yet.</p>
            ) : null}

            <div className="mt-4 space-y-3">
              {applications.map((application) => (
                <article key={application.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-slate-900">{application.title}</h3>
                      <p className="text-sm text-slate-600">
                        {application.company?.name ?? 'No company'} · {application.status}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-3 space-y-1 text-sm text-slate-600">
                    {application.jobUrl ? (
                      <div>
                        <dt className="sr-only">Job URL</dt>
                        <dd>
                          <a className="text-slate-900 underline" href={application.jobUrl} target="_blank" rel="noreferrer">
                            View job posting
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    {application.appliedDate ? (
                      <div>
                        <dt className="sr-only">Applied date</dt>
                        <dd>Applied: {new Date(application.appliedDate).toLocaleDateString()}</dd>
                      </div>
                    ) : null}
                    {application.description ? (
                      <div>
                        <dt className="sr-only">Description</dt>
                        <dd>{application.description}</dd>
                      </div>
                    ) : null}
                    {application.notes ? (
                      <div>
                        <dt className="sr-only">Notes</dt>
                        <dd>{application.notes}</dd>
                      </div>
                    ) : null}
                  </dl>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
