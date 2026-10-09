import { useState } from 'react';
import { Link } from 'react-router-dom';
import { nextStatus, useOrders } from '../store/orderStore';
import { useLeads } from '../store/leadStore';
import { useRequests } from '../store/requestStore';
import RequestsPanel from '../components/admin/RequestsPanel';
import { STATUS_META, HUBS } from '../data/status';
import { getProduct, getStyle } from '../data/products';
import { inr } from '../lib/pricing';
import { downloadBlob } from '../lib/image';
import { seedDemoData } from '../data/seed';
import { StatusPill } from '../components/Timeline';
import type { Lead, Order, Shipment } from '../types';

/** Demo-only gate. A real deployment needs proper authentication on a server. */
const PASSCODE = 'petti2026';
const AUTH_KEY = 'petti.admin';

function readAuth() {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  } catch {
    return false;
  }
}

export default function Admin() {
  const [authed, setAuthed] = useState(readAuth);
  const [code, setCode] = useState('');
  const [bad, setBad] = useState(false);
  const [tab, setTab] = useState<'requests' | 'orders' | 'leads'>('requests');
  const orders = useOrders((s) => s.orders);
  const leads = useLeads((s) => s.leads);
  const requests = useRequests((s) => s.requests);

  if (!authed)
    return (
      <div className="container-x max-w-sm py-24">
        <form
          className="card space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (code === PASSCODE) {
              try {
                sessionStorage.setItem(AUTH_KEY, '1');
              } catch {
                /* ignore */
              }
              setAuthed(true);
            } else setBad(true);
          }}
        >
          <h1 className="text-2xl font-semibold text-forest">Team login</h1>
          <input className="input" type="password" placeholder="Passcode" value={code} onChange={(e) => { setCode(e.target.value); setBad(false); }} autoFocus />
          {bad && <p className="text-sm text-red-700">Wrong passcode.</p>}
          <button className="btn-primary w-full">Enter</button>
          <p className="text-xs text-ink/50">Demo passcode: <code>{PASSCODE}</code></p>
        </form>
      </div>
    );

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Operations</p>
          <h1 className="mt-2 text-4xl font-semibold text-forest">Petti ops desk</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs" onClick={() => confirm('Restore the demo orders and leads? Your own orders and leads are kept.') && seedDemoData(true)}>
            Reset demo data
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat k="Open requests" v={requests.filter((r) => r.status !== 'closed').length} />
        <Stat k="Samples out" v={requests.filter((r) => r.status === 'sample_sent').length} />
        <Stat k="Orders" v={orders.length} />
        <Stat k="In production" v={orders.filter((o) => STATUS_META[o.shipments.find((s) => s.kind === 'main')!.status].phase === 'production').length} />
        <Stat k="Leads" v={leads.length} />
        <Stat k="Revenue" v={inr(Math.round(orders.reduce((a, o) => a + o.total, 0)))} />
      </div>

      <div className="mt-8 flex gap-2 border-b border-ink/10">
        {(['requests', 'orders', 'leads'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold capitalize ${tab === t ? 'border-clay text-ink' : 'border-transparent text-ink/50'}`}>
            {t === 'requests' ? 'Quotes & samples' : t} ({t === 'requests' ? requests.length : t === 'orders' ? orders.length : leads.length})
          </button>
        ))}
      </div>

      {tab === 'requests' ? (
        <RequestsPanel />
      ) : tab === 'orders' ? (
        <div className="mt-6 space-y-4">
          {orders.length === 0 && <p className="text-ink/60">No orders yet.</p>}
          {orders.map((o) => <OrderCard key={o.id} o={o} />)}
        </div>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">{k}</p>
      <p className="font-display text-2xl font-bold text-forest">{v}</p>
    </div>
  );
}

function OrderCard({ o }: { o: Order }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono font-bold">{o.id}</p>
          <p className="text-sm">{o.customer.name} · {o.customer.company || '—'} · {o.customer.city}</p>
          <p className="text-xs text-ink/50">{o.customer.email} · {o.customer.phone} · {new Date(o.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{inr(o.total)}</p>
          <Link to={`/track/${o.id}?c=${encodeURIComponent(o.customer.email)}`} className="text-xs text-forest underline">Customer view ↗</Link>
        </div>
      </div>
      <p className="mt-2 text-sm text-ink/70">
        {o.items.map((i) => `${getProduct(i.productId).name} (${getStyle(getProduct(i.productId), i.styleId).name}) × ${i.qty}${i.freeSample ? ' (+sample)' : ''}`).join(' · ')}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {o.shipments.map((s) => <ShipmentControls key={s.kind} orderId={o.id} s={s} />)}
      </div>
    </div>
  );
}

function ShipmentControls({ orderId, s }: { orderId: string; s: Shipment }) {
  const advance = useOrders((st) => st.advance);
  const addCheckpoint = useOrders((st) => st.addCheckpoint);
  const [hub, setHub] = useState(HUBS[1]);
  const [note, setNote] = useState('');
  const next = nextStatus(s);
  const canScan = s.status === 'shipped' || s.status === 'in_transit';
  return (
    <div className="rounded-xl bg-paper p-4 text-sm">
      <div className="flex items-center justify-between">
        <b>{s.kind === 'main' ? 'Main order' : 'Free sample'}</b>
        <StatusPill s={s} />
      </div>
      <p className="mt-1 text-xs text-ink/50">Last update: {new Date(s.events[s.events.length - 1].at).toLocaleString('en-IN')} · {s.events[s.events.length - 1].city}</p>
      <input className="input mt-3 !py-1.5" placeholder="Note for customer (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="mt-2 flex flex-wrap gap-2">
        {next ? (
          <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => { advance(orderId, s.kind, note.trim() || undefined); setNote(''); }}>
            Mark: {STATUS_META[next].label} →
          </button>
        ) : (
          <span className="text-xs font-semibold text-forest">✓ Complete</span>
        )}
        {canScan && (
          <span className="flex items-center gap-1">
            <select className="input !w-auto !py-1.5 text-xs" value={hub} onChange={(e) => setHub(e.target.value)} aria-label="Hub">
              {HUBS.map((h) => <option key={h}>{h}</option>)}
            </select>
            <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => { addCheckpoint(orderId, s.kind, hub, note.trim() || undefined); setNote(''); }}>
              + Hub scan
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

function LeadsTable({ leads }: { leads: Lead[] }) {
  const remove = useLeads((s) => s.remove);
  function exportCsv() {
    const cols: (keyof Lead)[] = ['id', 'createdAt', 'source', 'name', 'designation', 'company', 'address', 'email', 'phone', 'productInterest', 'monthlyQty', 'message'];
    const rows = leads.map((l) => cols.map((c) => csvCell(Array.isArray(l[c]) ? (l[c] as string[]).join('; ') : String(l[c] ?? ''))).join(','));
    downloadBlob([cols.join(','), ...rows].join('\n'), `petti-leads-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  }
  return (
    <div className="mt-6">
      <div className="mb-3 flex justify-end">
        <button className="btn-ghost text-xs" onClick={exportCsv} disabled={!leads.length}>⬇ Export CSV</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-paper text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="p-3">When</th><th className="p-3">Name</th><th className="p-3">Company</th><th className="p-3">Contact</th><th className="p-3">Interest</th><th className="p-3">Qty / mo</th><th className="p-3">Source</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-ink/5 align-top">
                <td className="p-3 text-xs text-ink/60">{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="p-3"><b>{l.name}</b><br /><span className="text-xs text-ink/50">{l.designation}</span></td>
                <td className="p-3">{l.company}<br /><span className="text-xs text-ink/50">{l.address}</span></td>
                <td className="p-3 text-xs"><a className="text-forest underline" href={`mailto:${l.email}`}>{l.email}</a><br />{l.phone && <a href={`tel:${l.phone}`}>{l.phone}</a>}</td>
                <td className="p-3 text-xs">{l.productInterest.map((p) => getProduct(p).name).join(', ') || '—'}{l.message && <p className="mt-1 italic text-ink/50">“{l.message}”</p>}</td>
                <td className="p-3 text-xs">{l.monthlyQty || '—'}</td>
                <td className="p-3"><span className={`pill ${l.source === 'starter-kit' ? 'bg-forest/10 text-forest' : l.source === 'instant-quote' ? 'bg-sky-100 text-sky-800' : 'bg-clay/10 text-clay'}`}>{l.source === 'starter-kit' ? 'Prototype kit' : l.source === 'instant-quote' ? 'Instant quote' : 'Enquiry'}</span></td>
                <td className="p-3"><button className="text-xs text-ink/40 hover:text-red-700" onClick={() => confirm(`Delete lead from ${l.name}?`) && remove(l.id)}>Delete</button></td>
              </tr>
            ))}
            {leads.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-ink/50">No leads yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
