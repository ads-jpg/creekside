'use strict';
// Rows shaped like Meta Insights answers, with last week's real numbers (Oct 26 – Nov 1, 2026).
// Schedule shows up only as a cost, as Meta returned it for this account.
const ad = (ad_id, ad_name, adset_name, spend, lpv, ff, leads, schedCost) => ({
  ad_id, ad_name, adset_name, campaign_name: 'CS | Form Start | Updated 10/23', spend: String(spend), impressions: '1000',
  actions: [{ action_type: 'link_click', value: '10' }, { action_type: 'landing_page_view', value: String(lpv) },
    ...(leads ? [{ action_type: 'offsite_conversion.fb_pixel_lead', value: String(leads) }] : [])],
  conversions: [{ action_type: 'offsite_conversion.fb_pixel_custom.form_start', value: String(ff) }],
  cost_per_conversion: schedCost ? [{ action_type: 'schedule_total', value: String(schedCost) }] : [],
});
const adRows = [
  ad('1', 'video 1', 'Leads | Broad + Exclusions | Sign', 70.28, 46, 6, 1),
  ad('2', 'video 2', 'Leads | Broad + Exclusions | Sign', 273.76, 278, 28, 1),
  ad('3', 'Print Van', 'Leads | Men Broad | Print Shop', 86.36, 62, 7, 3, 86.36),
  ad('4', 'Print United', 'Leads | Men Broad | Print Shop', 262.73, 158, 25, 14, 131.365),
];
const priorAdRows = [
  ad('2', 'video 2', 'Sign', 367.72, 383, 12, 0), ad('1', 'video 1', 'Sign', 304.36, 446, 18, 0),
  ad('4', 'Print United', 'Print Shop', 170.5, 163, 11, 0), ad('3', 'Print Van', 'Print Shop', 119.2, 97, 4, 0),
];
const day = (date_start, spend, ff, leads, schedCost) => ({ ...ad(null, null, null, spend, 0, ff, leads, schedCost), date_start, date_stop: date_start });
const dailyRows = [
  day('2026-10-26', 134.6, 16, 4), day('2026-10-27', 136.67, 14, 4, 136.67), day('2026-10-28', 132.34, 9, 1, 132.34),
  day('2026-10-29', 104.01, 8, 0, 104.01), day('2026-10-30', 101.88, 8, 5), day('2026-10-31', 80.67, 10, 5), day('2026-11-01', 2.96, 1, 0),
];
module.exports = { adRows, priorAdRows, dailyRows };
