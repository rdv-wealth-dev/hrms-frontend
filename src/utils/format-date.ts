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
