"use client";

import { createContext, useContext } from 'react';
import { DEFAULT_WHATSAPP_NUMBER } from '../../utils/site';

const SiteSettingsContext = createContext<any>(null);

/** Shares the settings loaded on the server by the (site) layout with client components. */
export function SiteSettingsProvider({ settings, children }: { settings: any; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

/** Site settings from `GET /api/settings`, or null if the API was unavailable. */
export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

/** WhatsApp number as digits only: whatsapp_number → contact_phone → phone_number → default. */
export function getWhatsappNumber(settings: any) {
  for (const key of ['whatsapp_number', 'contact_phone', 'phone_number']) {
    const digits = String(settings?.[key] ?? '').replace(/\D/g, '');
    if (digits) {
      return digits;
    }
  }

  return DEFAULT_WHATSAPP_NUMBER;
}
