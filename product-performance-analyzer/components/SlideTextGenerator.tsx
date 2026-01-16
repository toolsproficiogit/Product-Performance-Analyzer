
import React, { useState } from 'react';
import { AnalysisResult, CurrencyCode, SegmentType } from '../types';
import { CURRENCY_CONFIG, MAIRA_COLORS } from '../constants';

interface Props {
  data: AnalysisResult;
  currency: CurrencyCode;
}

type Language = 'CS' | 'SK' | 'EN';

const SlideTextGenerator: React.FC<Props> = ({ data, currency }) => {
  const [language, setLanguage] = useState<Language>('CS');
  const [copied, setCopied] = useState(false);
  
  const config = CURRENCY_CONFIG[currency];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(config.locale, { 
      style: 'currency', 
      currency: config.currency, 
      maximumFractionDigits: 0 
    }).format(val);

  const formatRoas = (val: number) => `${(val * 100).toFixed(0)} %`;
  const formatPct = (val: number) => `${val.toFixed(0)} %`;

  const topSegment = data.segments[SegmentType.TOP_PERFORMERS];
  const zeroRevenueSegment = data.segments[SegmentType.ZERO_REVENUE];
  const impressionOnlySegment = data.segments[SegmentType.IMPRESSION_ONLY];
  
  const totalProducts = data.totalProducts;
  const dateDays = data.dateRangeDays ? data.dateRangeDays.toString() : '__';
  
  // Non-performing products (Zero Revenue + Impression Only)
  const noRevCount = zeroRevenueSegment.count + impressionOnlySegment.count;
  const noRevPct = totalProducts > 0 ? (noRevCount / totalProducts) * 100 : 0;
  
  // Wasted budget (Cost of Zero Revenue + Cost of Impression Only)
  const wastedCostPct = zeroRevenueSegment.costPercentage + impressionOnlySegment.costPercentage;
  
  // Top performers % of total products
  const topCountPct = totalProducts > 0 ? (topSegment.count / totalProducts) * 100 : 0;

  const generateText = (lang: Language) => {
    const totalRev = formatCurrency(data.totalRevenue);
    const avgRoas = formatRoas(data.averageRoas);
    
    const topCount = topSegment.count.toLocaleString();
    const topCountPctStr = formatPct(topCountPct);
    const topRev = formatCurrency(topSegment.totalRevenue);
    const topRevPct = formatPct(topSegment.revenuePercentage);
    const topCostPct = formatPct(topSegment.costPercentage);
    
    const noRevCountStr = noRevCount.toLocaleString();
    const noRevPctStr = formatPct(noRevPct);
    const wastedCostPctStr = formatPct(wastedCostPct);

    switch (lang) {
      case 'CS':
        return `V účtu vidíme velký potenciál v segmentaci produktů na základě jejich výkonu.
Za posledních ${dateDays} dní si shoppingová síť na tržbách získala ${totalRev} s průměrným ROAS ${avgRoas}.

Nicméně zmíněného průměrného ROASu ${avgRoas} dosahuje pouze ${topCount} produktů (${topCountPctStr} produktů).
Tento segment produktů si dohromady získal ${topRev} (${topRevPct} veškerých tržeb).
Zároveň do tohoto segmentu bylo investováno pouze ${topCostPct} veškerého rozpočtu.

V účtu také vidíme ${noRevCountStr} produktů (${noRevPctStr} ze všech produktů), které nepřinesly za posledních ${dateDays} dní žádné tržby.

Shrnutí
Pouze ${topCostPct} investic jde do produktů, které přináší až ${topRevPct} tržeb.
Naopak až ${wastedCostPctStr} investic jde do produktů, které za posledních ${dateDays} dní nepřinesly žádné tržby.`;
      
      case 'SK':
        return `V účte vidíme veľký potenciál v segmentácii produktov na základe ich výkonu.
Za posledných ${dateDays} dní si shoppingová sieť na tržbách získala ${totalRev} s priemerným ROAS ${avgRoas}.

Avšak spomínaného priemerného ROASu ${avgRoas} dosahuje iba ${topCount} produktov (${topCountPctStr} produktov).
Tento segment produktov si dohromady získal ${topRev} (${topRevPct} všetkých tržieb).
Zároveň do tohto segmentu bolo investovaných iba ${topCostPct} celkového rozpočtu.

V účte tiež vidíme ${noRevCountStr} produktov (${noRevPctStr} zo všetkých produktov), ktoré nepriniesli za posledných ${dateDays} dní žiadne tržby.

Zhrnutie
Iba ${topCostPct} investícií ide do produktov, ktoré prinášajú až ${topRevPct} tržieb.
Naopak až ${wastedCostPctStr} investícií ide do produktov, ktoré za posledných ${dateDays} dní nepriniesli žiadne tržby.`;

      case 'EN':
        return `We see great potential in product segmentation based on performance.
Over the last ${dateDays} days, the shopping network generated ${totalRev} in revenue with an average ROAS of ${avgRoas}.

However, this average ROAS of ${avgRoas} is achieved by only ${topCount} products (${topCountPctStr} of products).
This product segment generated a total of ${topRev} (${topRevPct} of total revenue).
At the same time, only ${topCostPct} of the total budget was invested in this segment.

We also see ${noRevCountStr} products (${noRevPctStr} of all products) that generated no revenue over the last ${dateDays} days.

Summary
Only ${topCostPct} of investment goes to products that generate ${topRevPct} of revenue.
Conversely, ${wastedCostPctStr} of investment goes to products that generated no revenue in the last ${dateDays} days.`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateText(language));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4" style={{ backgroundColor: `${MAIRA_COLORS.primaryGreen}0D` }}>
        <div className="flex items-center gap-2">
           <h3 className="font-bold" style={{ color: MAIRA_COLORS.primaryOrange }}>Text for Slides</h3>
           <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: `${MAIRA_COLORS.primaryOrange}1A`, color: MAIRA_COLORS.primaryOrange }}>Presentation Ready</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            {(['CS', 'SK', 'EN'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  language === lang 
                    ? 'text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                style={{ backgroundColor: language === lang ? MAIRA_COLORS.primaryGreen : 'transparent' }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 relative">
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 font-mono text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {generateText(language)}
        </div>
        
        <button
          onClick={handleCopy}
          className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-slate-50"
          style={{ 
            color: MAIRA_COLORS.primaryGreen,
            borderColor: '#E2E8F0',
          }}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Text
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SlideTextGenerator;
