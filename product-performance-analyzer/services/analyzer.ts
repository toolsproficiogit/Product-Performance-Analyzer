import { AnalysisResult, RawProductData, SegmentType, SegmentMetrics, DimensionMetrics } from '../types';
import { COLUMN_MAPPING } from '../constants';
import { parseCSV } from '../utils/csvParser';

const cleanNumber = (str: string | undefined): number => {
  if (!str) return 0;
  if (str.includes('< 10%')) return 5;
  if (str.includes('> 90%')) return 95;
  
  let cleanStr = str.replace(/[^\d.,-]/g, '').trim();
  if (!cleanStr) return 0;

  const lastDot = cleanStr.lastIndexOf('.');
  const lastComma = cleanStr.lastIndexOf(',');

  if (lastDot > -1 && lastComma > -1) {
    if (lastComma > lastDot) {
      cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
    } else {
      cleanStr = cleanStr.replace(/,/g, '');
    }
  } else if (lastComma > -1) {
    cleanStr = cleanStr.replace(',', '.');
  }
  
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
};

const getColumnIndex = (headers: string[], keys: string[]): number => {
  const lowerHeaders = headers.map(h => h.toLowerCase());
  return lowerHeaders.findIndex(h => keys.some(k => h.includes(k)));
};

export const processFile = async (file: File, manualTargetRoas?: number): Promise<AnalysisResult> => {
  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length < 2) {
    throw new Error('File is empty or invalid CSV format.');
  }

  let headerRowIndex = -1;
  let idColIdx = -1;
  
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    idColIdx = getColumnIndex(rows[i], COLUMN_MAPPING.id);
    if (idColIdx !== -1) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Could not find "Item ID" column.');
  }

  const headers = rows[headerRowIndex];
  const brandIdx = getColumnIndex(headers, COLUMN_MAPPING.brand);
  const deviceIdx = getColumnIndex(headers, COLUMN_MAPPING.device);
  const clicksIdx = getColumnIndex(headers, COLUMN_MAPPING.clicks);
  const costIdx = getColumnIndex(headers, COLUMN_MAPPING.cost);
  const conversionsIdx = getColumnIndex(headers, COLUMN_MAPPING.conversions);
  const valueIdx = getColumnIndex(headers, COLUMN_MAPPING.conversionValue);
  const imprIdx = getColumnIndex(headers, COLUMN_MAPPING.impressions);
  const sisIdx = getColumnIndex(headers, COLUMN_MAPPING.searchImpressionShare);

  if (costIdx === -1 || valueIdx === -1) {
    throw new Error('Missing Cost or Conversion Value columns.');
  }

  const products: RawProductData[] = [];
  const brandStats: Record<string, DimensionMetrics> = {};
  const deviceStats: Record<string, DimensionMetrics> = {};

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[idColIdx]) continue;

    const cost = cleanNumber(row[costIdx]);
    const revenue = cleanNumber(row[valueIdx]);
    const clicks = clicksIdx > -1 ? cleanNumber(row[clicksIdx]) : 0;
    const conversions = conversionsIdx > -1 ? cleanNumber(row[conversionsIdx]) : 0;
    const impressions = imprIdx > -1 ? cleanNumber(row[imprIdx]) : 0;
    const sis = sisIdx > -1 ? cleanNumber(row[sisIdx]) : 0;
    const brand = brandIdx > -1 ? (row[brandIdx] || 'Unknown') : 'Unknown';
    const device = deviceIdx > -1 ? (row[deviceIdx] || 'Unknown') : 'Unknown';

    products.push({
      id: row[idColIdx],
      brand,
      device,
      clicks,
      cost,
      conversions,
      conversionValue: revenue,
      impressions,
      searchImpressionShare: sis
    });

    if (!brandStats[brand]) brandStats[brand] = { name: brand, cost: 0, revenue: 0, roas: 0, clicks: 0, conversions: 0 };
    brandStats[brand].cost += cost;
    brandStats[brand].revenue += revenue;
    brandStats[brand].clicks += clicks;
    brandStats[brand].conversions += conversions;

    if (!deviceStats[device]) deviceStats[device] = { name: device, cost: 0, revenue: 0, roas: 0, clicks: 0, conversions: 0 };
    deviceStats[device].cost += cost;
    deviceStats[device].revenue += revenue;
    deviceStats[device].clicks += clicks;
    deviceStats[device].conversions += conversions;
  }

  const totalCost = products.reduce((sum, p) => sum + p.cost, 0);
  const totalRevenue = products.reduce((sum, p) => sum + p.conversionValue, 0);
  const averageRoas = totalCost > 0 ? totalRevenue / totalCost : 0;

  // Threshold used for segmentation and opportunity logic
  const thresholdRoas = manualTargetRoas !== undefined ? manualTargetRoas : averageRoas;

  let totalWeightedIS = 0;
  let totalImpressionsForIS = 0;
  products.forEach(p => {
    if (p.impressions > 0 && p.searchImpressionShare > 0) {
      totalWeightedIS += p.searchImpressionShare * p.impressions;
      totalImpressionsForIS += p.impressions;
    }
  });
  const averageImpressionShare = totalImpressionsForIS > 0 ? totalWeightedIS / totalImpressionsForIS : 0;

  Object.values(brandStats).forEach(d => d.roas = d.cost > 0 ? d.revenue / d.cost : 0);
  Object.values(deviceStats).forEach(d => d.roas = d.cost > 0 ? d.revenue / d.cost : 0);

  const brandPerformance = Object.values(brandStats).sort((a, b) => b.cost - a.cost);
  const devicePerformance = Object.values(deviceStats).sort((a, b) => b.cost - a.cost);

  const segments: Record<SegmentType, SegmentMetrics> = {
    [SegmentType.TOP_PERFORMERS]: { type: SegmentType.TOP_PERFORMERS, count: 0, totalCost: 0, totalRevenue: 0, totalClicks: 0, roas: 0, averageCpc: 0, costPercentage: 0, revenuePercentage: 0 },
    [SegmentType.LOW_PERFORMERS]: { type: SegmentType.LOW_PERFORMERS, count: 0, totalCost: 0, totalRevenue: 0, totalClicks: 0, roas: 0, averageCpc: 0, costPercentage: 0, revenuePercentage: 0 },
    [SegmentType.ZERO_REVENUE]: { type: SegmentType.ZERO_REVENUE, count: 0, totalCost: 0, totalRevenue: 0, totalClicks: 0, roas: 0, averageCpc: 0, costPercentage: 0, revenuePercentage: 0 },
    [SegmentType.IMPRESSION_ONLY]: { type: SegmentType.IMPRESSION_ONLY, count: 0, totalCost: 0, totalRevenue: 0, totalClicks: 0, roas: 0, averageCpc: 0, costPercentage: 0, revenuePercentage: 0 },
    [SegmentType.OTHER]: { type: SegmentType.OTHER, count: 0, totalCost: 0, totalRevenue: 0, totalClicks: 0, roas: 0, averageCpc: 0, costPercentage: 0, revenuePercentage: 0 },
  };

  const potentialProducts: RawProductData[] = [];
  const overspendingProducts: RawProductData[] = [];

  products.forEach(p => {
    let segmentType = SegmentType.OTHER;
    const productRoas = p.cost > 0 ? p.conversionValue / p.cost : 0;

    if (p.conversionValue > 0) {
      if (productRoas >= thresholdRoas) {
        segmentType = SegmentType.TOP_PERFORMERS;
      } else {
        segmentType = SegmentType.LOW_PERFORMERS;
      }
    } else {
      if (p.clicks > 0) {
        segmentType = SegmentType.ZERO_REVENUE;
      } else if (p.impressions > 0) {
        segmentType = SegmentType.IMPRESSION_ONLY;
      }
    }

    const segment = segments[segmentType];
    segment.count++;
    segment.totalCost += p.cost;
    segment.totalRevenue += p.conversionValue;
    segment.totalClicks += p.clicks;

    // Potential: Efficient (>= threshold) but under-exposed (< 40% IS)
    if (productRoas >= thresholdRoas && p.searchImpressionShare < 40 && p.searchImpressionShare > 0) {
      potentialProducts.push(p);
    }
    // Overspending: Inefficient (< threshold) and over-exposed (> 50% IS)
    if (p.cost > 0 && productRoas < thresholdRoas && p.searchImpressionShare > 50) {
      overspendingProducts.push(p);
    }
  });

  Object.values(segments).forEach(s => {
    s.roas = s.totalCost > 0 ? s.totalRevenue / s.totalCost : 0;
    s.averageCpc = s.totalClicks > 0 ? s.totalCost / s.totalClicks : 0;
    s.costPercentage = totalCost > 0 ? (s.totalCost / totalCost) * 100 : 0;
    s.revenuePercentage = totalRevenue > 0 ? (s.totalRevenue / totalRevenue) * 100 : 0;
  });

  return {
    totalProducts: products.length,
    totalCost,
    totalRevenue,
    averageRoas,
    averageImpressionShare,
    dateRangeDays: 30,
    segments,
    brandPerformance,
    devicePerformance,
    potentialProducts: potentialProducts.sort((a, b) => b.conversionValue - a.conversionValue),
    overspendingProducts: overspendingProducts.sort((a, b) => b.cost - a.cost)
  };
};