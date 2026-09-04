/**
 * JS mirror of the --evc-* custom properties declared in src/index.less.
 *
 * Inline React styles and styled-components can both read the CSS variables directly
 * (`var(--evc-signal)`), and that is the preferred form. This module exists for the
 * places that need the resolved value instead - chart colour arrays, canvas, and any
 * prop that is passed to a library rather than to CSS.
 *
 * Keep the two in sync: index.less is the source of truth.
 */
export const tokens = {
  ink: '#06202e',
  inkRaise: '#0d3243',
  inkDeep: '#000f18',
  onInk: 'rgba(255, 255, 255, 0.94)',
  onInkMuted: 'rgba(255, 255, 255, 0.62)',

  signal: '#57bb60',
  signalDeep: '#3f9e48',
  signalLift: '#8be39a',
  signalWash: 'rgba(87, 187, 96, 0.1)',

  tide: '#55b0d4',
  tideLift: '#89dff1',
  mint: '#7dd487',
  alert: '#d7183f',

  paper: '#ffffff',
  paperSub: '#f2f5f6',
  line: '#e6eaec',
  lineSoft: '#eef2f3',
  text: '#10222c',
  textMuted: '#5b7180',
  textFaint: '#90a3ae',

  fontDisplay: '"Archivo Variable", "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontBody: '"Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  fontMono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

export default tokens;
