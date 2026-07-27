'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { FeedbackMessage } from '@/components/ui/feedback-message';

type Profile = {
  id: string;
  name?: string | null;
  preferredName?: string | null;
  email: string;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
};

function toInputValue(value?: string | null) {
  return value ?? '';
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const profileLinks = [
    { label: 'GitHub', value: githubUrl.trim() },
    { label: 'LinkedIn', value: linkedinUrl.trim() },
    { label: 'Portfolio', value: portfolioUrl.trim() },
  ].filter((link) => link.value.length > 0);

  async function loadProfile() {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await fetch('/api/profile');

      if (response.status === 401) {
        router.replace('/auth/signin');
        return;
      }

      if (!response.ok) {
        throw new Error('Could not load profile.');
      }

      const data = (await response.json()) as { profile: Profile };
      const nextProfile = data.profile;

      setProfile(nextProfile);
      setName(toInputValue(nextProfile.name));
      setPreferredName(toInputValue(nextProfile.preferredName));
      setGithubUrl(toInputValue(nextProfile.githubUrl));
      setLinkedinUrl(toInputValue(nextProfile.linkedinUrl));
      setPortfolioUrl(toInputValue(nextProfile.portfolioUrl));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load profile.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          preferredName,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
        }),
      });

      if (response.status === 401) {
        router.replace('/auth/signin');
        return;
      }

      const responseData = (await response.json().catch(() => null)) as
        | { profile?: Profile; error?: string; details?: Record<string, string[]> }
        | null;

      if (!response.ok) {
        const fieldErrors = responseData?.details
          ? Object.values(responseData.details)
              .flat()
              .filter(Boolean)
          : [];

        throw new Error(fieldErrors[0] ?? responseData?.error ?? 'Could not save profile.');
      }

      const nextProfile = responseData?.profile;

      if (nextProfile) {
        setProfile(nextProfile);
        setName(toInputValue(nextProfile.name));
        setPreferredName(toInputValue(nextProfile.preferredName));
        setGithubUrl(toInputValue(nextProfile.githubUrl));
        setLinkedinUrl(toInputValue(nextProfile.linkedinUrl));
        setPortfolioUrl(toInputValue(nextProfile.portfolioUrl));
      }

      setSuccessMessage('Profile updated.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Manage how your name and professional links appear across your application tracker."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Personal details</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Use your formal name for records and a preferred name for friendlier display later.
              </p>
            </div>
            {isSaving ? (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                Saving...
              </span>
            ) : null}
          </div>

          {isLoading ? <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Loading profile...</p> : null}
          {loadError ? (
            <FeedbackMessage
              variant="error"
              title="Could not load profile."
              message={loadError}
              className="mt-6"
            />
          ) : null}

          {!isLoading && !loadError ? (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              {saveError ? (
                <FeedbackMessage
                  variant="error"
                  title="Could not save profile."
                  message={saveError}
                  onDismiss={() => setSaveError('')}
                />
              ) : null}
              {!saveError && successMessage ? (
                <FeedbackMessage
                  variant="success"
                  message={successMessage}
                  onDismiss={() => setSuccessMessage('')}
                  autoDismissMs={5000}
                />
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="name">
                    Formal display name
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={80}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                    placeholder="Your formal name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="preferredName">
                    Preferred name
                  </label>
                  <input
                    id="preferredName"
                    value={preferredName}
                    onChange={(event) => setPreferredName(event.target.value)}
                    maxLength={50}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                    placeholder="Nickname or preferred name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  value={profile?.email ?? ''}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Email is managed by your account and can’t be edited here.</p>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="githubUrl">
                    GitHub URL
                  </label>
                  <input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(event) => setGithubUrl(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="linkedinUrl">
                    LinkedIn URL
                  </label>
                  <input
                    id="linkedinUrl"
                    type="url"
                    value={linkedinUrl}
                    onChange={(event) => setLinkedinUrl(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                    placeholder="https://www.linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="portfolioUrl">
                    Portfolio URL
                  </label>
                  <input
                    id="portfolioUrl"
                    type="url"
                    value={portfolioUrl}
                    onChange={(event) => setPortfolioUrl(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                    placeholder="https://your-portfolio.com"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {isSaving ? 'Saving profile...' : 'Save profile'}
                </button>
              </div>
            </form>
          ) : null}
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Profile links</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Quick access to your saved professional links.</p>

            {profileLinks.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {profileLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.value}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-100">{link.label}</span>
                      <span className="truncate pl-3 text-right text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
                        {link.value}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                Add your GitHub, LinkedIn, or portfolio links to keep them handy.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Profile tips</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p>
                Your formal display name stays separate from your preferred name, so you can keep applications professional while still setting up a friendlier identity for future UI use.
              </p>
              <p>
                Leave link fields blank if you don’t want to show them yet. Blank values are saved safely as empty profile links.
              </p>
              <p>
                Use full URLs including <span className="font-medium text-slate-700 dark:text-slate-200">https://</span> so validation passes cleanly.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}