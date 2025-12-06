
import { SegmentType, GroupColorMap, CurrencyCode } from './types';

export const MAIRA_COLORS = {
  primaryGreen: '#083027',
  primaryOrange: '#F54A23',
  secondaryGrey: '#E7E7E7',
};

export const SEGMENT_COLORS: GroupColorMap = {
  [SegmentType.TOP_PERFORMERS]: MAIRA_COLORS.primaryGreen, // Brand Dark Green
  [SegmentType.LOW_PERFORMERS]: MAIRA_COLORS.primaryOrange, // Brand Orange
  [SegmentType.ZERO_REVENUE]: '#525252', // Neutral Dark Grey
  [SegmentType.IMPRESSION_ONLY]: '#9CA3AF', // Neutral Grey
  [SegmentType.OTHER]: '#D1D5DB', // Light Grey
};

export const SEGMENT_DESCRIPTIONS: Record<SegmentType, string> = {
  [SegmentType.TOP_PERFORMERS]: 'ROAS ≥ Average. High efficiency.',
  [SegmentType.LOW_PERFORMERS]: '0 < ROAS < Average. Generating revenue but inefficiently.',
  [SegmentType.ZERO_REVENUE]: 'Clicks > 0 but ROAS = 0. Budget wastage.',
  [SegmentType.IMPRESSION_ONLY]: 'Impressions > 0 but 0 Clicks. Visibility without traffic.',
  [SegmentType.OTHER]: 'Data insufficient for categorization.'
};

export const CURRENCY_CONFIG: Record<CurrencyCode, { locale: string; currency: string; label: string }> = {
  CZK: { locale: 'cs-CZ', currency: 'CZK', label: 'CZK (Kč)' },
  EUR: { locale: 'de-DE', currency: 'EUR', label: 'EUR (€)' },
  USD: { locale: 'en-US', currency: 'USD', label: 'USD ($)' },
};

// Mappings for CSV parsing (normalized lowercase to standard key)
export const COLUMN_MAPPING = {
  id: ['item id', 'id položky', 'id'],
  brand: ['brand', 'značka'],
  device: ['device', 'zařízení'],
  clicks: ['clicks', 'kliknutí', 'prokliky'],
  impressions: ['impr.', 'zobr.', 'impr', 'zobrazení'],
  cost: ['cost', 'cena'],
  conversions: ['conversions', 'konverze'],
  conversionValue: ['conv. value', 'hodnota konverze', 'hodnota kov.'],
  searchImpressionShare: ['search impr. share', 'podíl zobr. ve vyhledávací síti', 'podíl zobrazení']
};
