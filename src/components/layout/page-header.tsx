type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
      {description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p> : null}
    </div>
  );
}
