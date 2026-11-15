import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, ClipboardCheck } from 'lucide-react';
import api from '../api';
import { useAuth, homeFor } from '../context/AuthContext.jsx';
import { stockLevel } from '../components/ui.jsx';

const MAX = 50;

function Tile({ bloodGroup, units }) {
  const level = stockLevel(units);
  const color = level === 'Critical' ? 'bg-blood' : level === 'Low' ? 'bg-orange-400' : 'bg-emerald-500';
  return (
    <div className="panel relative overflow-hidden p-4">
      <div className={`fill-in absolute inset-x-0 bottom-0 opacity-15 ${color}`} style={{ height: `${Math.min(100, (units / MAX) * 100)}%` }} />
      <div className="relative">
        <div className="font-display text-3xl font-extrabold">{bloodGroup}</div>
        <div className="mt-3 text-2xl font-semibold">{units}<span className="ml-1 text-xs font-normal text-slate-500">units</span></div>
        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold"><span className={`h-2 w-2 rounded-full ${color}`} />{level}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [stock, setStock] = useState([]);
  useEffect(() => { api.get('/inventory').then((r) => setStock(r.data)).catch(() => {}); }, []);

  return (
    <div className="space-y-12">
      <section className="grid items-end gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h1 className="text-5xl leading-[1.05] text-wine">Blood, matched to the patient who needs it.</h1>
          <p className="mt-4 max-w-md text-slate-600">
            Donors book a screened appointment. Families raise a request with a doctor’s letter. Admins verify both and keep the stock count true.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <Link className="btn-primary btn" to={homeFor(user.role)}>Open your dashboard</Link>
            ) : (
              <>
                <Link className="btn-primary btn" to="/register?role=donor">Become a donor</Link>
                <Link className="btn-ghost btn" to="/register?role=receiver">Request blood</Link>
              </>
            )}
          </div>
        </div>
        <div className="lg:col-span-3">
          <h2 className="mb-3 text-lg">Stock available right now</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(stock.length ? stock : Array.from({ length: 8 }, (_, i) => ({ bloodGroup: '–', units: 0, i }))).map((s, i) => <Tile key={s.bloodGroup + i} {...s} />)}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          [ClipboardCheck, 'Health check before booking', 'Age, weight, hemoglobin, the 90-day gap and a health declaration are checked before an appointment is created.'],
          [ShieldCheck, 'Every request is verified', 'An admin reviews the prescription and confirms stock before any blood is issued.'],
          [HeartHandshake, 'Stock moves only when blood does', 'Units are added when a donation is collected and removed when a request is fulfilled.'],
        ].map(([Icon, t, d]) => (
          <div key={t} className="panel">
            <Icon className="text-blood" size={22} />
            <h3 className="mt-3 text-lg">{t}</h3>
            <p className="mt-1 text-sm text-slate-600">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
