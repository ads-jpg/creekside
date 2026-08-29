import site from '../../site.config.json';

export default site;

/** A section renders when it exists and has not been explicitly switched off. */
export const on = (section) => Boolean(section) && section.enabled !== false;

/** Self-hosted-free type stacks. No webfont request means no render delay. */
export const FONT_STACKS = {
  system:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  geometric:
    '"Avenir Next", Avenir, "Century Gothic", ui-sans-serif, system-ui, "Segoe UI", sans-serif',
};

export const fontStack = (name) => FONT_STACKS[name] ?? FONT_STACKS.system;

/** Hidden fields the form carries so ad clicks can be attributed in the CRM. */
export const ATTRIBUTION_FIELDS = [
  'gclid',
  'wbraid',
  'gbraid',
  'fbclid',
  'msclkid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];
