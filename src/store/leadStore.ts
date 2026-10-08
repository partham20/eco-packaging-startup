import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lead } from '../types';
import { leadId } from '../lib/ids';

interface LeadState {
  leads: Lead[];
  add: (lead: Omit<Lead, 'id' | 'createdAt'>) => Lead;
  remove: (id: string) => void;
  replaceAll: (leads: Lead[]) => void;
}

export const useLeads = create<LeadState>()(
  persist(
    (set, get) => ({
      leads: [],
      add: (data) => {
        const lead: Lead = { ...data, id: leadId(), createdAt: new Date().toISOString() };
        set({ leads: [lead, ...get().leads] });
        return lead;
      },
      remove: (id) => set({ leads: get().leads.filter((l) => l.id !== id) }),
      replaceAll: (leads) => set({ leads }),
    }),
    { name: 'petti.leads' },
  ),
);
