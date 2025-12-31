/**
 * iCalendar (.ics) export utility
 * Generates RFC 5545 compliant iCalendar files
 */

interface ICalEvent {
  title: string
  description?: string
  location?: string
  start: Date
  end: Date
  uid?: string
}

/**
 * Format date to iCalendar format: YYYYMMDDTHHMMSS
 */
function formatICalDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

/**
 * Escape special characters in iCalendar text fields
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Generate iCalendar (.ics) file content from events
 */
export function generateICalendar(events: ICalEvent[], calendarName: string = 'Расписание'): string {
  const now = new Date()
  const timestamp = formatICalDate(now)

  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Anatomia Study Platform//Schedule//EN',
    `X-WR-CALNAME:${escapeICalText(calendarName)}`,
    'X-WR-TIMEZONE:Europe/Chisinau',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  events.forEach((event, index) => {
    const uid = event.uid || `${timestamp}-${index}@anatomia.com`

    ical.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART:${formatICalDate(event.start)}`,
      `DTEND:${formatICalDate(event.end)}`,
      `SUMMARY:${escapeICalText(event.title)}`,
    )

    if (event.description) {
      ical.push(`DESCRIPTION:${escapeICalText(event.description)}`)
    }

    if (event.location) {
      ical.push(`LOCATION:${escapeICalText(event.location)}`)
    }

    ical.push(
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT'
    )
  })

  ical.push('END:VCALENDAR')

  return ical.join('\r\n')
}

/**
 * Download iCalendar file
 */
export function downloadICalendar(content: string, filename: string = 'schedule.ics'): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

/**
 * Generate and download iCalendar file from events
 */
export function exportToICalendar(
  events: ICalEvent[],
  filename: string = 'schedule.ics',
  calendarName: string = 'Расписание'
): void {
  const icalContent = generateICalendar(events, calendarName)
  downloadICalendar(icalContent, filename)
}
