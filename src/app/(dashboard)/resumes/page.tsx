'use client';

import { useEffect, useState, type FormEvent } from 'react';

type Resume = {
  id: string;
  title: string;
  content: string;
  isDefault: boolean;
  createdAt?: string;
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [editingResumeId, setEditingResumeId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  async function loadData() {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await fetch('/api/resumes');

      if (!response.ok) {
        throw new Error('Failed to load resumes.');
      }

      const data = (await response.json()) as { resumes: Resume[] };
      setResumes(data.resumes ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load resumes.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function resetForm() {
    setEditingResumeId('');
    setTitle('');
    setContent('');
    setIsDefault(false);
    setFormError('');
  }

  function startEdit(resume: Resume) {
    setEditingResumeId(resume.id);
    setTitle(resume.title);
    setContent(resume.content);
    setIsDefault(resume.isDefault);
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
      const isEditing = Boolean(editingResumeId);
      const response = await fetch(isEditing ? `/api/resumes/${editingResumeId}` : '/api/resumes', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, isDefault }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? 'Failed to save resume.');
      }

      resetForm();
      await loadData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save resume.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteResume(resumeId: string) {
    const confirmed = window.confirm('Delete this resume?');

    if (!confirmed) {
      return;
    }

    setLoadError('');

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? 'Failed to delete resume.');
      }

      if (editingResumeId === resumeId) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to delete resume.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Resumes</h1>
          <p className="mt-2 text-sm text-slate-600">Keep multiple resume versions ready for matching.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{editingResumeId ? 'Edit resume' : 'New resume'}</h2>

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

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="content">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(event) => setIsDefault(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Set as default resume
              </label>

              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (editingResumeId ? 'Saving...' : 'Creating...') : editingResumeId ? 'Save changes' : 'Create resume'}
                </button>

                {editingResumeId ? (
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
              <h2 className="text-lg font-semibold text-slate-900">Your resumes</h2>
              <span className="text-sm text-slate-500">{resumes.length} total</span>
            </div>

            {isLoading ? <p className="mt-4 text-sm text-slate-600">Loading resumes...</p> : null}
            {loadError ? <p className="mt-4 text-sm text-red-600">{loadError}</p> : null}

            {!isLoading && !loadError && resumes.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No resumes yet.</p>
            ) : null}

            <div className="mt-4 space-y-3">
              {resumes.map((resume) => (
                <article key={resume.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {resume.title}{' '}
                        {resume.isDefault ? <span className="text-sm text-slate-500">(Default)</span> : null}
                      </h3>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(resume)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteResume(resume.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">{resume.content}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
