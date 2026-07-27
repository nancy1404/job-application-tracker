import { useEffect, type ReactNode } from 'react';

type FeedbackVariant = 'success' | 'error' | 'info' | 'warning';

type FeedbackMessageProps = {
  variant: FeedbackVariant;
  title?: string;
  message: string;
  action?: ReactNode;
  onDismiss?: () => void;
  autoDismissMs?: number;
  className?: string;
};

const variantClasses: Record<
  FeedbackVariant,
  {
    container: string;
    badge: string;
    title: string;
    message: string;
    dismiss: string;
  }
> = {
  success: {
    container:
      'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/30',
    badge: 'bg-emerald-500 dark:bg-emerald-400',
    title: 'text-emerald-900 dark:text-emerald-100',
    message: 'text-emerald-900/90 dark:text-emerald-100/90',
    dismiss:
      'border-emerald-300 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-900/40',
  },
  error: {
    container: 'border-rose-200 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/30',
    badge: 'bg-rose-500 dark:bg-rose-400',
    title: 'text-rose-900 dark:text-rose-100',
    message: 'text-rose-900/90 dark:text-rose-100/90',
    dismiss:
      'border-rose-300 text-rose-900 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-100 dark:hover:bg-rose-900/40',
  },
  info: {
    container: 'border-sky-200 bg-sky-50/80 dark:border-sky-900/50 dark:bg-sky-950/30',
    badge: 'bg-sky-500 dark:bg-sky-400',
    title: 'text-sky-900 dark:text-sky-100',
    message: 'text-sky-900/90 dark:text-sky-100/90',
    dismiss:
      'border-sky-300 text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:text-sky-100 dark:hover:bg-sky-900/40',
  },
  warning: {
    container: 'border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30',
    badge: 'bg-amber-500 dark:bg-amber-400',
    title: 'text-amber-900 dark:text-amber-100',
    message: 'text-amber-900/90 dark:text-amber-100/90',
    dismiss:
      'border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-900/40',
  },
};

export function FeedbackMessage({
  variant,
  title,
  message,
  action,
  onDismiss,
  autoDismissMs,
  className,
}: FeedbackMessageProps) {
  const classes = variantClasses[variant];

  useEffect(() => {
    if (!onDismiss || !autoDismissMs) {
      return;
    }

    const timerId = window.setTimeout(() => {
      onDismiss();
    }, autoDismissMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [autoDismissMs, onDismiss]);

  return (
    <section
      className={[
        'rounded-xl border p-4 shadow-sm',
        classes.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {title ? (
            <div className="flex items-center gap-2">
              <span className={['h-2.5 w-2.5 rounded-full', classes.badge].join(' ')} aria-hidden="true" />
              <h3 className={['text-sm font-semibold', classes.title].join(' ')}>{title}</h3>
            </div>
          ) : null}
          <p className={[title ? 'mt-1' : '', 'text-sm', classes.message].filter(Boolean).join(' ')}>{message}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className={[
              'shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition',
              classes.dismiss,
            ].join(' ')}
            aria-label="Dismiss message"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </section>
  );
}
