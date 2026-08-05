export interface FormatDateOptions {
  treatAsDateOnly?: boolean;
  includeTime?: boolean;
  locale?: string;
}

/**
 * Formats a date string, timestamp, or Date object into a readable string.
 * Supports treatAsDateOnly: true (using UTC) to prevent off-by-one shifts in IST/local timezones.
 */
export function formatDate(
  dateInput?: string | Date | number | null,
  options: FormatDateOptions = {}
): string {
  if (!dateInput) return "-";

  const { treatAsDateOnly = false, includeTime = false, locale = "en-US" } = options;

  try {
    let date: Date;

    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === "string") {
      // If date string is YYYY-MM-DD and treatAsDateOnly is true, append T00:00:00Z for consistent UTC parsing
      if (treatAsDateOnly && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
        date = new Date(`${dateInput.trim()}T00:00:00Z`);
      } else {
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return "-";

    const formatOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(treatAsDateOnly ? { timeZone: "UTC" } : {}),
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    };

    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  } catch (error) {
    return "-";
  }
}

/**
 * Formats a time string or timestamp into hh:mm AM/PM format.
 */
export function formatTime(timeInput?: string | Date | number | null): string {
  if (!timeInput) return "--:--";

  try {
    let date: Date;
    if (timeInput instanceof Date) {
      date = timeInput;
    } else if (typeof timeInput === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(timeInput.trim())) {
      // Handle HH:mm or HH:mm:ss string directly
      const [h, m] = timeInput.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 || 12;
      const displayMinute = m.toString().padStart(2, "0");
      return `${displayHour.toString().padStart(2, "0")}:${displayMinute} ${period}`;
    } else {
      date = new Date(timeInput);
    }

    if (isNaN(date.getTime())) return "--:--";

    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (error) {
    return "--:--";
  }
}

/**
 * Converts any date input to YYYY-MM-DD format for HTML date inputs and API payloads.
 */
export function formatToYYYYMMDD(dateInput?: string | Date | number | null): string {
  if (!dateInput) return "";

  try {
    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
      return dateInput.trim();
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    return "";
  }
}

/**
 * Formats a date range cleanly (e.g., "01 Aug 2026 - 05 Aug 2026").
 */
export function formatDateRange(
  startDateInput?: string | Date | null,
  endDateInput?: string | Date | null,
  options: FormatDateOptions = { treatAsDateOnly: true }
): string {
  if (!startDateInput && !endDateInput) return "-";
  if (!endDateInput || startDateInput === endDateInput) {
    return formatDate(startDateInput, options);
  }
  return `${formatDate(startDateInput, options)} - ${formatDate(endDateInput, options)}`;
}

/**
 * Parses user input such as "8:40", "08:40", "9:30", "8.5", "8,5", or "8" into decimal hours (e.g. 8.67 or 9.5).
 */
export function parseWorkingHoursToDecimal(input: string | number): number {
  if (typeof input === "number") return Math.round(input * 100) / 100;
  if (!input) return 8;

  const str = String(input).trim();
  if (!str) return 8;

  if (str.includes(":")) {
    const parts = str.split(":").map((p) => parseInt(p, 10));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const hours = parts[0];
      const minutes = parts[1];
      const decimalHours = hours + minutes / 60;
      return Math.round(decimalHours * 100) / 100;
    }
  }

  const num = parseFloat(str.replace(",", "."));
  if (!isNaN(num) && num >= 0 && num <= 24) {
    return Math.round(num * 100) / 100;
  }

  return 8;
}

/**
 * Formats a decimal or HH:MM hours input into display text for inputs (e.g., 8.67 -> "08:40", 9.5 -> "09:30", 8 -> "8").
 */
export function formatWorkingHoursDisplay(input: string | number): string {
  if (typeof input === "string" && input.includes(":")) return input;
  const num = typeof input === "number" ? input : parseFloat(String(input));
  if (isNaN(num) || num <= 0) return "8";

  const totalMins = Math.round(num * 60);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  if (mins === 0) return String(hours);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(mins)}`;
}

/**
 * Calculates the exact HH:MM display between start time (e.g. "11:00") and end time (e.g. "19:40").
 */
export function calculateWorkingHoursFromTimes(startTimeStr: string, endTimeStr: string): string {
  if (!startTimeStr || !endTimeStr) return "8";

  const parseToMinutes = (timeStr: string): number | null => {
    const trimmed = timeStr.trim().toUpperCase();
    if (!trimmed) return null;

    const isPM = trimmed.includes("PM");
    const isAM = trimmed.includes("AM");
    const cleanStr = trimmed.replace(/(AM|PM)/g, "").trim();

    const parts = cleanStr.split(":").map((v) => parseInt(v, 10));
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;

    let hours = parts[0];
    const minutes = parts[1];

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const startMins = parseToMinutes(startTimeStr);
  const endMins = parseToMinutes(endTimeStr);

  if (startMins === null || endMins === null) return "8";

  let diffMins = endMins - startMins;
  if (diffMins < 0) {
    diffMins += 24 * 60; // Night shift spanning midnight
  }

  const hours = Math.floor(diffMins / 60);
  const mins = Math.round(diffMins % 60);

  if (mins === 0) return String(hours);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(mins)}`;
}
