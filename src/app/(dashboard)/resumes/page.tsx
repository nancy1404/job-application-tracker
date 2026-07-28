'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { FeedbackMessage } from '@/components/ui/feedback-message';

type Resume = {
  id: string;
  title: string;
  content: string;
  isDefault: boolean;
  fileName?: string | null;
  fileUrl?: string | null;
  uploadedAt?: string | null;
  createdAt?: string;
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingResumeId, setEditingResumeId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadedAt, setUploadedAt] = useState('');

  async function loadData() {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await fetch('/api/resumes');

      if (!response.ok) {
        throw new Error('Could not load resumes.');
      }

      const data = (await response.json()) as { resumes: Resume[] };
      setResumes(data.resumes ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load resumes.');
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
    setFileName('');
    setFileUrl('');
    setUploadedAt('');
    setFormError('');
  }

  function startEdit(resume: Resume) {
    setEditingResumeId(resume.id);
    setTitle(resume.title);
    setContent(resume.content);
    setIsDefault(resume.isDefault);
    setFileName(resume.fileName ?? '');
    setFileUrl(resume.fileUrl ?? '');
    setUploadedAt(resume.uploadedAt ?? '');
    setFormError('');
  }

  function cancelEdit() {
    resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const isEditing = Boolean(editingResumeId);
      const trimmedFileName = fileName.trim();
      const trimmedFileUrl = fileUrl.trim();
      const nextUploadedAt = trimmedFileUrl ? uploadedAt || new Date().toISOString() : undefined;
      const response = await fetch(isEditing ? `/api/resumes/${editingResumeId}` : '/api/resumes', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          isDefault,
          fileName: trimmedFileName,
          fileUrl: trimmedFileUrl,
          uploadedAt: nextUploadedAt,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not save resume.');
      }

      resetForm();
      await loadData();
      setSuccessMessage(isEditing ? 'Resume updated.' : 'Resume created.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save resume.');
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
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Could not delete resume.');
      }

      if (editingResumeId === resumeId) {
        resetForm();
      }

      await loadData();
      setSuccessMessage('Resume deleted.');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not delete resume.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Resumes</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Keep multiple resume versions ready for matching.</p>
        </header>

        {successMessage ? (
          <FeedbackMessage
            variant="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage('')}
            autoDismissMs={5000}
            className="mb-6"
          />
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{editingResumeId ? 'Edit resume' : 'New resume'}</h2>

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

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="content">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(event) => setIsDefault(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                />
                Set as default resume
              </label>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Resume/CV file link</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Paste a link to a PDF, DOCX, Google Drive file, or portfolio-hosted resume. Files are not uploaded to this app.
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="fileName">
                      External file name
                    </label>
                    <input
                      id="fileName"
                      value={fileName}
                      onChange={(event) => setFileName(event.target.value)}
                      placeholder="Resume 2026 PDF"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="fileUrl">
                      External file URL
                    </label>
                    <input
                      id="fileUrl"
                      type="url"
                      value={fileUrl}
                      onChange={(event) => setFileUrl(event.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  To remove an external link while editing, clear both fields and save.
                </p>
              </div>

              {formError ? (
                <FeedbackMessage
                  variant="error"
                  title="Could not save resume."
                  message={formError}
                  onDismiss={() => setFormError('')}
                />
              ) : null}

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
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your resumes</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">{resumes.length} total</span>
            </div>

            {isLoading ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Loading resumes...</p> : null}
            {loadError ? (
              <FeedbackMessage
                variant="error"
                title="Could not load resumes."
                message={loadError}
                onDismiss={() => setLoadError('')}
                className="mt-4"
              />
            ) : null}

            {!isLoading && !loadError && resumes.length === 0 ? (
              <EmptyState
                title="No resumes yet"
                description="Create your first resume to start matching opportunities."
                className="mt-4 p-6"
              />
            ) : null}

            <div className="mt-4 space-y-3">
              {resumes.map((resume) => (
                <article key={resume.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {resume.title}{' '}
                        {resume.isDefault ? <span className="text-sm text-slate-500 dark:text-slate-400">(Default)</span> : null}
                      </h3>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(resume)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteResume(resume.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 dark:border-red-800 dark:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {resume.fileUrl ? (
                    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {resume.fileName?.trim() ? resume.fileName : 'Resume/CV link'}
                      </p>
                      <a
                        href={resume.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex text-sm text-slate-700 underline underline-offset-2 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                      >
                        Open file
                      </a>
                    </div>
                  ) : null}

                  <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{resume.content}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
