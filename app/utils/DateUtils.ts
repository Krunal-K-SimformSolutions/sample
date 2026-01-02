import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import _ from 'lodash';
import { RegexConst } from '../constants';

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a sec',
    m: 'a min',
    mm: '%d mins',
    h: 'an hr',
    hh: '%d hrs',
    d: 'a day',
    dd: '%d days',
    M: 'a mth',
    MM: '%d mths',
    y: 'a yr',
    yy: '%d yrs'
  }
});

export const DISPLAY_DAY_FORMAT = 'DD';
export const DISPLAY_WEEK_DAY_FORMAT = 'ddd';
export const DISPLAY_SLASH_DATE_FORMAT = 'DD/MM/YYYY';
export const DISPLAY_12_TIME_FORMAT = 'hh:mm A';
export const DISPLAY_DASH_DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Formats a date string using the specified format.
 *
 * @param {string | Date | dayjs.Dayjs | number} date - The date string to format.
 * @param {string} [format=DISPLAY_SLASH_DATE_FORMAT] - The format string to use for formatting the date.
 * @returns {string} The formatted date string.
 */
export const applyFormat = (
  date: string | Date | dayjs.Dayjs | number,
  format: string = DISPLAY_SLASH_DATE_FORMAT
): string => {
  return dayjs(date).format(format);
};

/**
 * Converts a date from one format to another.
 *
 * @param {string | Date} date - The date string or Date object to convert.
 * @param {string} [inputFormat=DISPLAY_SLASH_DATE_FORMAT] - The format of the input date. Defaults to DISPLAY_SLASH_DATE_FORMAT.
 * @param {string} [outputFormat=DISPLAY_DASH_DATE_FORMAT] - The desired format for the output date. Defaults to DISPLAY_DASH_DATE_FORMAT.
 * @returns {string} The date formatted in the specified output format.
 */
export const convertFormat = (
  date: string | Date,
  inputFormat: string = DISPLAY_SLASH_DATE_FORMAT,
  outputFormat: string = DISPLAY_DASH_DATE_FORMAT
) => {
  return applyFormat(dayjs(date, inputFormat), outputFormat);
};

/**
 * Converts a date string to a Date object.
 *
 * @param {string} date - The date string to convert.
 * @param {string} [format=DISPLAY_SLASH_DATE_FORMAT] - The format string to use for parsing the date. Defaults to DISPLAY_SLASH_DATE_FORMAT.
 * @returns {Date} The converted Date object.
 */
export const convertDate = (date: string, format: string = DISPLAY_SLASH_DATE_FORMAT): Date => {
  if (_.isEmpty(date)) {
    return dayjs().toDate();
  }
  return dayjs(date, format).toDate();
};

/**
 * Converts a date string to a Dayjs object.
 *
 * @param {string} date - The date string to convert.
 * @param {string} [format=DISPLAY_SLASH_DATE_FORMAT] - The format string to use for parsing the date. Defaults to DISPLAY_SLASH_DATE_FORMAT.
 * @returns {dayjs.Dayjs} The converted Dayjs object.
 */
export const convertDayjs = (
  date: string,
  format: string = DISPLAY_SLASH_DATE_FORMAT
): dayjs.Dayjs => {
  if (_.isEmpty(date)) {
    return dayjs.utc();
  }
  return dayjs.utc(date, format);
};

/**
 * Checks if a given date string is a valid date of birth.
 *
 * The function assumes that the given date string is in the format specified by the
 * `format` parameter. If no format is specified, the default format is assumed to be
 * `DD/MM/YYYY`.
 *
 * A valid date of birth is considered to be any date that is before the current date.
 *
 * @param {string} date - The date string to check.
 * @param {string} [format=DISPLAY_SLASH_DATE_FORMAT] - The format of the date string.
 * @returns {boolean} True if the date string is a valid date of birth, false otherwise.
 */
export const isValidDob = (date: string, format: string = DISPLAY_SLASH_DATE_FORMAT): boolean => {
  return dayjs(date, format).isBefore(dayjs(), 'day');
};

/**
 * Returns an object with two properties: minDate and maxDate.
 * minDate is 100 years ago from the current year (January 1st of that year).
 * maxDate is today's date.
 *
 * @returns {{ minDate: Date; maxDate: Date }} An object with minDate and maxDate properties.
 */
export const getDobRange = (): { minDate: Date; maxDate: Date } => {
  const currentDate = dayjs();
  const minDate = currentDate.subtract(100, 'year').startOf('year'); // January 1st, 100 years ago
  const maxDate = currentDate; // Today's date

  return { minDate: minDate.toDate(), maxDate: maxDate.toDate() };
};

/**
 * Generates a unique timestamp string in the format 'YYYYMMDDHHmmssSSSS'.
 *
 * @returns {string} A unique timestamp string.
 */
export const getTimeStampForUniqueID = (): string => {
  return dayjs().format('YYYYMMDDHHmmssSSSS');
};

/**
 * Returns the current date in the format specified by DISPLAY_SLASH_DATE_FORMAT.
 *
 * This is used to populate the current date in the date picker in the fitness profile form.
 *
 * @param {string} startDate - The date string to determine the current date from. If not provided, the current date is used.
 * @param {string} [format=DISPLAY_DASH_DATE_FORMAT] - The format string to use for parsing the date. Defaults to DISPLAY_DASH_DATE_FORMAT.
 * @returns {string} The current date in the format 'DD/MM/YYYY'.
 */
export const getCurrentDate = (
  startDate?: string,
  format: string = DISPLAY_DASH_DATE_FORMAT
): string => {
  const tempStartDate =
    _.isNil(startDate) || _.isEmpty(startDate) ? dayjs() : dayjs(startDate, format);
  const currentDate = tempStartDate.startOf('isoWeek');
  return applyFormat(currentDate.toDate());
};

/**
 * Returns the timestamp of the current day.
 *
 * The timestamp is the number of milliseconds elapsed since the Unix Epoch (January 1, 1970 00:00:00 UTC).
 *
 * @returns {number} The timestamp of the current day.
 */
export const getTodayDateTimestamp = (): number => {
  return dayjs().startOf('day').valueOf();
};

/**
 * Determines if the given date is at least one day before the given today date.
 *
 * @param {number} date - The timestamp of the date to check, in milliseconds.
 * @param {number} today - The timestamp of today's date, in milliseconds.
 * @returns {boolean} True if the given date is at least one day before today, false otherwise.
 */
export const isNextDay = (date: number, today: number): boolean => {
  return dayjs(today).diff(dayjs(date), 'day') >= 1;
};

/**
 * Returns the current greeting period as 'morning', 'afternoon', or 'evening'.
 *
 * The greeting period is determined by the current hour of the day.
 * If the current hour is before 12, the greeting period is 'morning'.
 * If the current hour is between 12 and 18, the greeting period is 'afternoon'.
 * If the current hour is after 18, the greeting period is 'evening'.
 *
 * @returns {string} The current greeting period as a string.
 */
export const determineGreetingPeriod = (): string => {
  const currentHour = dayjs().hour();

  if (currentHour < 12) return 'morning';
  if (currentHour < 18) return 'afternoon';
  return 'evening';
};

/**
 * Checks if the given start date is the same or before the given end date.
 *
 * @param {dayjs.Dayjs} start - The start date to check.
 * @param {dayjs.Dayjs} end - The end date to check against.
 * @returns {boolean} True if the start date is the same or before the end date, false otherwise.
 */
export const isSameOrBefore = (start: dayjs.Dayjs, end: dayjs.Dayjs): boolean => {
  return start.isBefore(end, 'day') || start.isSame(end, 'day');
};

/**
 * Checks if the given start date is the same or after the given end date.
 *
 * @param {dayjs.Dayjs} start - The start date to check.
 * @param {dayjs.Dayjs} end - The end date to check against.
 * @returns {boolean} True if the start date is the same or after the end date, false otherwise.
 */
export const isSameOrAfter = (start: dayjs.Dayjs, end: dayjs.Dayjs): boolean => {
  return start.isSame(end, 'day') ? false : start.isAfter(end, 'day');
};

/**
 * Checks if the given two dates are the same day.
 *
 * The function compares the given dates based on their day, ignoring the time.
 * If the given dates are the same day, the function returns true, otherwise false.
 *
 * @param {string} [date1] - The first date to compare.
 * @param {string} [date2] - The second date to compare.
 * @param {string} [date2Format=DISPLAY_SLASH_DATE_FORMAT] - The format of the second date string. Defaults to DISPLAY_SLASH_DATE_FORMAT.
 * @returns {boolean} True if the given dates are the same day, false otherwise.
 */
export const isSameDay = (
  date1?: string,
  date2?: string | null,
  date2Format: string = DISPLAY_SLASH_DATE_FORMAT
): boolean => {
  if (_.isEmpty(date1) || _.isEmpty(date2) || _.isNil(date1) || _.isNil(date2)) {
    return false;
  }

  return dayjs(date1, DISPLAY_DASH_DATE_FORMAT).isSame(dayjs(date2, date2Format), 'day');
};

/**
 * Checks if the given start date is before the given end date.
 *
 * The function compares the given dates based on their day, ignoring the time.
 * If the given start date is before the given end date, the function returns true, otherwise false.
 *
 * @param {string} [date1] - The start date to check.
 * @param {string|null} [date2] - The end date to check against.
 * @param {string} [date1Format=DISPLAY_DASH_DATE_FORMAT] - The format of the start date string. Defaults to DISPLAY_DASH_DATE_FORMAT.
 * @param {string} [date2Format=DISPLAY_SLASH_DATE_FORMAT] - The format of the end date string. Defaults to DISPLAY_SLASH_DATE_FORMAT.
 * @returns {boolean} True if the given start date is before the given end date, false otherwise.
 */
export const isBefore = (
  date1?: string,
  date2?: string | null,
  date1Format: string = DISPLAY_DASH_DATE_FORMAT,
  date2Format: string = DISPLAY_SLASH_DATE_FORMAT
): boolean => {
  if (_.isEmpty(date1) || _.isEmpty(date2) || _.isNil(date1) || _.isNil(date2)) {
    return false;
  }

  return dayjs(date1, date1Format).isBefore(dayjs(date2, date2Format), 'day');
};

/**
 * Checks if the given start date is before the given end date.
 *
 * The function compares the given dates based on their day, ignoring the time.
 * If the given start date is before the given end date, the function returns true, otherwise false.
 *
 * @param {string} [date1] - The start date to check.
 * @param {string|null} [date2] - The end date to check against.
 * @param {string} [date1Format=DISPLAY_DASH_DATE_FORMAT] - The format of the start date string. Defaults to DISPLAY_DASH_DATE_FORMAT.
 * @param {string} [date2Format=DISPLAY_SLASH_DATE_FORMAT] - The format of the end date string. Defaults to DISPLAY_SLASH_DATE_FORMAT.
 * @returns {boolean} True if the given start date is before the given end date, false otherwise.
 */
export const isAfter = (
  date1?: string,
  date2?: string | null,
  date1Format: string = DISPLAY_SLASH_DATE_FORMAT,
  date2Format: string = DISPLAY_SLASH_DATE_FORMAT
): boolean => {
  if (_.isEmpty(date1) || _.isEmpty(date2) || _.isNil(date1) || _.isNil(date2)) {
    return false;
  }

  return dayjs(date1, date1Format).isAfter(dayjs(date2, date2Format), 'day');
};

/**
 * Checks if the given timestamp is before the current date.
 *
 * The function compares the given timestamp with the current date, ignoring the time.
 * If the given timestamp is before the current date, the function returns true, otherwise false.
 *
 * @param {number} [date1] - The timestamp to check.
 * @returns {boolean} True if the given timestamp is before the current date, false otherwise.
 */
export const isBeforeDate = (date1?: number): boolean => {
  if (_.isNil(date1)) {
    return false;
  }

  return dayjs().isBefore(dayjs(date1), 'day');
};

/**
 * Calculates the number of days between the given start and end dates.
 *
 * @param {string} [startDate] - The start date string.
 * @param {string} [endDate] - The end date string.
 * @param {string} [format=DISPLAY_DASH_DATE_FORMAT] - The format of the date strings. Defaults to DISPLAY_DASH_DATE_FORMAT.
 * @returns {number} The number of days between the start and end dates.
 */
export const getDayDifference = (
  startDate?: string,
  endDate?: string,
  format: string = DISPLAY_DASH_DATE_FORMAT
): number => {
  if (_.isEmpty(startDate) || _.isEmpty(endDate) || _.isNil(startDate) || _.isNil(endDate)) {
    return 0;
  }

  return dayjs(endDate, format).diff(dayjs(startDate, format), 'day');
};

/**
 * Checks if the given string is a valid date string according to the given format.
 *
 * If the given string is empty or not a string, the function returns false.
 * If the given string is a valid date string according to the given format, the function returns true.
 * Otherwise, the function returns false.
 *
 * @param {string} str - The date string to check.
 * @param {string} [format=DISPLAY_DASH_DATE_FORMAT] - The format of the date string. Defaults to DISPLAY_DASH_DATE_FORMAT.
 * @returns {boolean} True if the given string is a valid date string according to the given format, false otherwise.
 */
export const isValidDate = (str: string, format: string = DISPLAY_DASH_DATE_FORMAT): boolean => {
  if (_.isEmpty(str)) return false;
  return dayjs(str, format).isValid();
};

/**
 * Returns the current timestamp as the number of milliseconds since the Unix Epoch.
 *
 * @returns {number} The current timestamp in milliseconds.
 */
export const getCurrentTimestamp = (): number => {
  return dayjs().valueOf();
};

/**
 * Calculates the duration in seconds between two timestamps.
 *
 * @param {number} startTime - The start timestamp in milliseconds.
 * @param {number} endTime - The end timestamp in milliseconds.
 * @returns {number} The duration in seconds.
 */
export const getDurationInSeconds = (startTime: number, endTime: number): number => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  if (!start.isValid() || !end.isValid() || startTime === 0 || endTime === 0) {
    return 0;
  }
  return end.diff(start, 'second');
};

/**
 * Pads a number with leading zeros to ensure it is at least two digits long.
 *
 * @param {number} n - The number to pad.
 * @returns {string} A string representation of the number, padded with leading zeros if necessary.
 */
export const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Converts a duration in seconds to a formatted string in the format HH:MM:SS.
 *
 * @param {number} totalSeconds - The duration in seconds.
 * @returns {string} A string representing the time in the format HH:MM:SS.
 */
export const formatSecondsToHHMMSS = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Converts a duration in seconds to a formatted time string in the format 'HH:MM:SS' or 'MM:SS'.
 *
 * @param {number} duration - The duration in seconds.
 * @param {boolean} withHours - Whether to include hours in the output string.
 * @returns {string} A string representing the time.
 */
export const getDurationTime = (duration: number, withHours: boolean = true): string => {
  if (!Number.isFinite(duration)) return '';

  const seconds = Math.floor(duration % 60);
  const minutes = Math.floor((duration / 60) % 60);
  const hours = Math.floor((duration / 3600) % 24);

  if (withHours) {
    return hours
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  } else {
    return `${pad(minutes)}:${pad(seconds)}`;
  }
};

/**
 * Returns the relative time from the given date to now.
 *
 * @param {string | Date} date - The date to compare to now.
 * @param {string} [inputFormat=DISPLAY_DASH_DATE_FORMAT] - The format of the input date string.
 * @returns {string} A string representing the relative time (e.g., '3 days ago', 'in 2 hours').
 */
export const getRelativeTime = (
  date: string | Date,
  inputFormat: string = DISPLAY_DASH_DATE_FORMAT
): string => {
  const timeAgo = dayjs(date, inputFormat).fromNow();
  return timeAgo;
};

/**
 * Removes the time from a given date string.
 *
 * @param {string} [date] - The date string from which to remove the time.
 * @param {string} [inputFormat=DISPLAY_DASH_DATE_FORMAT] - The format of the input date string.
 * @param {string} [outputFormat=DISPLAY_SLASH_DATE_FORMAT] - The format of the output date string.
 * @returns {string} The date string without the time component.
 */
export const removeTimeFromDate = (
  date?: string,
  inputFormat: string = DISPLAY_DASH_DATE_FORMAT,
  outputFormat: string = DISPLAY_SLASH_DATE_FORMAT
): string => {
  if (_.isEmpty(date)) return '';
  return convertFormat((date ?? '').replace(RegexConst.date, ''), inputFormat, outputFormat);
};
