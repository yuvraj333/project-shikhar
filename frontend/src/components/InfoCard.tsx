import React from 'react';

export default function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
        {icon}
        {label}
      </p>
      <p className="break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}