import { useState } from 'react';
import { FileText } from 'lucide-react';
import { openFile, errMsg } from '../api';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');

const tone = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-sky-100 text-sky-800',
  completed: 'bg-emerald-100 text-emerald-800',
  fulfilled: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose text-blood',
  cancelled: 'bg-slate-200 text-slate-600',
  critical: 'bg-blood text-white',
  urgent: 'bg-orange-100 text-orange-800',
  normal: 'bg-slate-100 text-slate-600',
};

export const Badge = ({ value }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tone[value] || tone.normal}`}>{value}</span>
);

export const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="label">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
  </label>
);

export const Alert = ({ children, type = 'error' }) =>
  children ? (
    <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${type === 'error' ? 'border-blood/30 bg-rose text-wine' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}>{children}</div>
  ) : null;

export const Empty = ({ children }) => <p className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-sm text-slate-500">{children}</p>;

export const PageHead = ({ title, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <h1 className="text-3xl">{title}</h1>
    <div className="flex gap-2">{children}</div>
  </div>
);

export function FileLink({ name }) {
  const [err, setErr] = useState('');
  if (!name) return <span className="text-xs text-slate-400">No document</span>;
  return (
    <button className="inline-flex items-center gap-1 text-xs font-semibold text-blood hover:underline" onClick={() => openFile(name).catch((e) => setErr(errMsg(e)))}>
      <FileText size={14} /> {err || 'View document'}
    </button>
  );
}

export const stockLevel = (u) => (u < 5 ? 'Critical' : u < 15 ? 'Low' : 'Healthy');
