
export enum SegmentType {
  TOP_PERFORMERS = 'Top Products',
  LOW_PERFORMERS = 'Low Performing Products',
  ZERO_REVENUE = 'Zero Revenue Products',
  IMPRESSION_ONLY = 'Impression Only Products',
  OTHER = 'Uncategorized'
}

export type CurrencyCode = 'CZK' | 'EUR' | 'USD';

export interface RawProductData {
  id: string;
  brand: string;
  device: string;
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
  conversionValue: number;
  searchImpressionShare: number; // Stored as percentage (e.g. 10.5 for 10.5%)
}

export interface SegmentMetrics {
  type: SegmentType;
  count: number;
  totalCost: number;
  totalRevenue: number;
  totalClicks: number;
  roas: number;
  averageCpc: number;
  costPercentage: number;
  revenuePercentage: number;
}

export interface DimensionMetrics {
  name: string;
  cost: number;
  revenue: number;
  roas: number;
  clicks: number;
  conversions: number;
}

export interface AnalysisResult {
  totalProducts: number;
  totalCost: number;
  totalRevenue: number;
  averageRoas: number;
  averageImpressionShare: number;
  dateRangeDays: number | null;
  segments: Record<SegmentType, SegmentMetrics>;
  brandPerformance: DimensionMetrics[];
  devicePerformance: DimensionMetrics[];
  potentialProducts: RawProductData[]; // ROAS > Avg && SIS < 30%
  overspendingProducts: RawProductData[]; // ROAS < Avg && SIS > 50%
}

export type GroupColorMap = Record<SegmentType, string>;