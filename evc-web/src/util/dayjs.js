import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';

/**
 * Single dayjs entry point for the app. dayjs ships a tiny core and puts everything else behind
 * plugins, so importing 'dayjs' directly gives you an instance where `.utc()`, `.tz()` and
 * `dayjs(value, format)` are silently missing. Import from here instead.
 *
 * - utc + timezone  replace moment-timezone (`moment.utc`, `moment.tz`, `.tz(zone)`)
 * - customParseFormat  makes `dayjs(value, format)` parse rather than guess
 * - localizedFormat  enables the `L`/`LL`/`ll` tokens, which is how a date gets written the way
 *   the active locale writes it. Display code must use those and never a hand-built pattern:
 *   pro-components' provider calls `dayjs.locale()` from the antd ConfigProvider locale, so under
 *   zh-CN a literal 'D MMM YYYY' renders "5 8月 2024" instead of "2024年8月5日".
 *
 * Note dayjs is immutable where moment mutates in place: `d.add(1, 'day')` returns a new
 * instance and leaves `d` alone.
 */
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

export default dayjs;
