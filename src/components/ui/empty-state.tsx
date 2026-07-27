import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={[
        'rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
