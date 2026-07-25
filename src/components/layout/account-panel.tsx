'use client';

import { useEffect, useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';

type SessionUser = {
  name?: string | null;
  email?: string | null;
};

type SessionResponse = {
  user?: SessionUser | null;
};

export function AccountPanel() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session');
        const data = (await response.json().catch(() => null)) as SessionResponse | null;

        if (!isMounted) {
          return;
        }

        setUser(data?.user ?? null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const primaryIdentity = useMemo(() => {
    const name = user?.name?.trim();
    const email = user?.email?.trim();

    return name || email || 'Account';
  }, [user]);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/auth/signin' });
  }

  return (
    <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Account</p>

      {isLoading ? (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Loading...</p>
      ) : (
        <>
          <p className="mt-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100">{primaryIdentity}</p>
          <dl className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex gap-1">
              <dt className="font-medium text-slate-700 dark:text-slate-200">Name:</dt>
              <dd className="truncate">{user?.name?.trim() || 'Not set'}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="font-medium text-slate-700 dark:text-slate-200">Email:</dt>
              <dd className="truncate">{user?.email?.trim() || 'Not set'}</dd>
            </div>
          </dl>
        </>
      )}

      <button
        type="button"
        onClick={() => {
          void handleSignOut();
        }}
        disabled={isSigningOut}
        className="mt-3 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        {isSigningOut ? 'Logging out...' : 'Logout'}
      </button>
    </section>
  );
}
