import type { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
  updatedAt?: string;
  icon?: ReactNode;
  iconBg?: string;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
      <span className="w-1 h-4 rounded-full bg-blue-600 inline-block" />
      {children}
    </h2>
  );
}

export default function PageTitle({ title, description, updatedAt, icon, iconBg = 'bg-blue-700' }: PageTitleProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-1">
        {icon && (
          <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shadow-sm flex-shrink-0`}>
            {icon}
          </div>
        )}
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>
      {description && <p className="text-slate-500 text-sm mt-1 ml-12">{description}</p>}
      {updatedAt && (
        <p className="text-slate-400 text-xs mt-1 ml-12 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          기준 시각: {updatedAt}
        </p>
      )}
    </div>
  );
}
