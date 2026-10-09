import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { QuoteRequest, QuotationDetail, RequestStatus, SampleDispatch } from '../types';
import { requestId } from '../lib/ids';

/**
 * Requests carry design files as data URLs, which can fill the browser's ~5 MB quota. When a write
 * fails we drop the file payloads of all but the newest requests and retry, so a new request is
 * always saved even if older attachments have to go.
 */
const tolerantStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      try {
        const parsed = JSON.parse(value);
        const list: QuoteRequest[] = parsed?.state?.requests ?? [];
        parsed.state.requests = list.map((r, i) =>
          i < 1 ? r : { ...r, preview: undefined, files: r.files.map((f) => ({ ...f, dataUrl: undefined })) },
        );
        localStorage.setItem(name, JSON.stringify(parsed));
      } catch {
        /* storage full or unavailable: the request stays in memory for this session */
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export type NewRequest = Omit<QuoteRequest, 'id' | 'createdAt' | 'status' | 'events' | 'quotation' | 'sample'>;

interface RequestState {
  requests: QuoteRequest[];
  add: (data: NewRequest) => QuoteRequest;
  startReview: (id: string, note?: string) => void;
  sendQuote: (id: string, q: QuotationDetail) => void;
  dispatchSample: (id: string, s: SampleDispatch) => void;
  markSampleDelivered: (id: string, note?: string) => void;
  close: (id: string, note?: string) => void;
  remove: (id: string) => void;
  replaceAll: (requests: QuoteRequest[]) => void;
}

/** Order the production team moves a request through. */
export const REQUEST_FLOW: RequestStatus[] = ['new', 'reviewing', 'quoted', 'sample_sent', 'sample_delivered', 'closed'];

export const REQUEST_META: Record<RequestStatus, { label: string; customer: string }> = {
  new: { label: 'New', customer: 'We have your request and your design files.' },
  reviewing: { label: 'In review', customer: 'Our team is checking your specs and artwork.' },
  quoted: { label: 'Quote sent', customer: 'Your quotation is ready.' },
  sample_sent: { label: 'Sample dispatched', customer: 'Your physical sample is on its way.' },
  sample_delivered: { label: 'Sample delivered', customer: 'Your sample has arrived. Tell us what you think.' },
  closed: { label: 'Closed', customer: 'This request is complete.' },
};

const now = () => new Date().toISOString();

function patch(requests: QuoteRequest[], id: string, fn: (r: QuoteRequest) => QuoteRequest) {
  return requests.map((r) => (r.id === id ? fn(r) : r));
}

const withEvent = (r: QuoteRequest, status: RequestStatus, note: string): QuoteRequest => ({
  ...r,
  status,
  events: [...r.events, { at: now(), status, note }],
});

export const useRequests = create<RequestState>()(
  persist(
    (set, get) => ({
      requests: [],
      add: (data) => {
        const at = now();
        const req: QuoteRequest = {
          ...data,
          id: requestId(),
          createdAt: at,
          status: 'new',
          events: [{ at, status: 'new', note: data.wantsSample ? 'Quote and sample requested.' : 'Quote requested.' }],
        };
        set({ requests: [req, ...get().requests] });
        return req;
      },
      startReview: (id, note) =>
        set({ requests: patch(get().requests, id, (r) => (r.status === 'new' ? withEvent(r, 'reviewing', note || REQUEST_META.reviewing.customer) : r)) }),
      // a quotation can be sent or revised at any stage; it only moves the status forward from new / in review
      sendQuote: (id, q) =>
        set({
          requests: patch(get().requests, id, (r) =>
            withEvent(
              { ...r, quotation: q },
              r.status === 'new' || r.status === 'reviewing' ? 'quoted' : r.status,
              q.note || `Quotation of ₹${q.total.toLocaleString('en-IN')} for ${q.qty.toLocaleString('en-IN')} pieces confirmed.`,
            ),
          ),
        }),
      dispatchSample: (id, s) =>
        set({
          requests: patch(get().requests, id, (r) =>
            withEvent({ ...r, sample: s }, 'sample_sent', s.note || `Sample handed to ${s.courier}, tracking ${s.awb}.`),
          ),
        }),
      markSampleDelivered: (id, note) =>
        set({
          requests: patch(get().requests, id, (r) =>
            withEvent(
              { ...r, sample: r.sample ? { ...r.sample, deliveredAt: now() } : r.sample },
              'sample_delivered',
              note || 'Sample delivered to the customer.',
            ),
          ),
        }),
      close: (id, note) => set({ requests: patch(get().requests, id, (r) => withEvent(r, 'closed', note || 'Request closed.')) }),
      remove: (id) => set({ requests: get().requests.filter((r) => r.id !== id) }),
      replaceAll: (requests) => set({ requests }),
    }),
    { name: 'petti.requests', storage: createJSONStorage(() => tolerantStorage) },
  ),
);

/** Lookup for the customer tracking page: request ID plus the email or phone used on the request. */
export function findRequest(requests: QuoteRequest[], id: string, contact: string): QuoteRequest | undefined {
  const c = contact.trim().toLowerCase();
  const digits = c.replace(/\D/g, '');
  return requests.find(
    (r) =>
      r.id.toLowerCase() === id.trim().toLowerCase() &&
      (r.customer.email.toLowerCase() === c || (digits.length >= 10 && r.customer.phone.replace(/\D/g, '').endsWith(digits.slice(-10)))),
  );
}
