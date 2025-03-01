export const PROVINCE_MAP = {
  ON: 'Ontario',
  BC: 'British Columbia',
  AB: 'Alberta',
  SK: 'Saskatchewan',
  MB: 'Manitoba',
  QC: 'Quebec',
  PE: 'Prince Edward Island',
  NS: 'Nova Scotia',
  NB: 'New Brunswick',
} as const

export const PROVINCES = ['ON', 'BC', 'AB', 'SK', 'MB', 'QC', 'PE', 'NS', 'NB'] as const

export type Province = (typeof PROVINCES)[number]
export type ProvinceName = (typeof PROVINCE_MAP)[Province]
