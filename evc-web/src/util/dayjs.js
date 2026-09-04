import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

/**
 * Single dayjs entry point for the app. dayjs ships a tiny core and puts everything else behind
 * plugins, so importing 'dayjs' directly gives you an instance where `.utc()`, `.tz()` and
 * `dayjs(value, format)` are silently missing. Import from here instead.
 *
 * - utc + timezone  replace moment-timezone (`moment.utc`, `moment.tz`, `.tz(zone)`)
 * - customParseFormat  makes `dayjs(value, format)` parse rather than guess
 *
 * Note dayjs is immutable where moment mutates in place: `d.add(1, 'day')` returns a new
 * instance and leaves `d` alone.
 */
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export default dayjs;
