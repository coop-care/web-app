const units = {
  year: 1000 * 60 * 60 * 24 * 365,
  month: 1000 * 60 * 60 * 24 * 30,
  week: 1000 * 60 * 60 * 24 * 7,
  day: 1000 * 60 * 60 * 24,
  hour: 1000 * 60 * 60,
  minute: 1000 * 60,
  second: 1000
} as Record<Intl.RelativeTimeFormatUnit, number>

export function format(date: Date, locale: string, options: Intl.RelativeTimeFormatOptions = {}) {
  const formatter = new Intl.RelativeTimeFormat(locale, Object.assign({ numeric: "auto" }, options))
  const elapsed = date.getTime() - Date.now();
  const absoluteElapsed = Math.abs(elapsed);

  for (const unit in units) {
    if (absoluteElapsed > units[unit as Intl.RelativeTimeFormatUnit] || unit == "second") {
      return formatter.format(Math.round(elapsed / units[unit as Intl.RelativeTimeFormatUnit]), unit as Intl.RelativeTimeFormatUnit)
    }
  }
}