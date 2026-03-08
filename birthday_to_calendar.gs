/**
 * Syncs birthdays from Google Contacts into the primary Google Calendar.
 *
 * - Uses the People API to read contacts
 * - Prefers "Speichern unter" (fileAses) as the display name
 * - Deletes all existing birthday events first, then recreates them
 * - Creates all-day recurring annual events with eventType "birthday"
 * - Run syncBirthdaysToCalendar() to perform the sync
 */

function syncBirthdaysToCalendar() {
  Logger.log("=== syncBirthdaysToCalendar started ===");

  deletePrimaryBirthdayEvents();

  const contacts = fetchContactsWithBirthdays();
  Logger.log(`Fetched ${contacts.length} contacts with birthdays`);

  let created = 0;
  for (const contact of contacts) {
    createBirthdayEvent(contact);
    Logger.log(`  CREATED: ${contact.name} -${contact.birthday.formatted}`);
    created++;
  }

  Logger.log(`=== Done: ${created} created ===`);
}

// ---------------------------------------------------------------------------
// Contact fetching
// ---------------------------------------------------------------------------

function fetchContactsWithBirthdays() {
  const results = [];
  let nextPageToken = null;
  let page = 0;

  do {
    page++;
    const params = {
      resourceName: "people/me",
      personFields: "names,birthdays,fileAses",
      pageSize: 1000,
    };
    if (nextPageToken) params.pageToken = nextPageToken;

    Logger.log(`Fetching contacts page ${page}...`);
    const response = People.People.Connections.list("people/me", params);
    const connections = response.connections || [];
    Logger.log(`  Page ${page}: ${connections.length} contacts`);

    for (const person of connections) {
      const birthday = getBirthday(person);
      if (!birthday) continue;
      results.push({
        name: getDisplayName(person),
        birthday,
      });
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return results;
}

function getDisplayName(person) {
  const fileAses = person.fileAses || [];
  if (fileAses.length > 0 && fileAses[0].value) return fileAses[0].value;

  const names = person.names || [];
  if (names.length > 0) return names[0].displayName || "(No Name)";

  return "(No Name)";
}

function getBirthday(person) {
  const bday = (person.birthdays || [])[0]?.date;
  if (!bday?.day || !bday?.month) return null;

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const formatted = bday.year
    ? `${bday.day} ${monthNames[bday.month - 1]} ${bday.year}`
    : `${bday.day} ${monthNames[bday.month - 1]}`;

  return { day: bday.day, month: bday.month, year: bday.year || null, formatted };
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

function createBirthdayEvent(contact) {
  const { day, month } = contact.birthday;
  const year = new Date().getFullYear();
  const startDate = new Date(year, month - 1, day);
  const endDate = new Date(year, month - 1, day + 1);

  const pad = n => String(n).padStart(2, "0");
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const rrule = (month === 2 && day === 29)
    ? "RRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1"
    : "RRULE:FREQ=YEARLY";

  Calendar.Events.insert({
    summary: `${contact.name} Geburtstag`,
    start: { date: fmt(startDate) },
    end: { date: fmt(endDate) },
    eventType: "birthday",
    recurrence: [rrule],
    transparency: "transparent",
    visibility: "private",
    reminders: { useDefault: true },
  }, "primary");
}

function deletePrimaryBirthdayEvents() {
  let pageToken = null;
  let total = 0;
  do {
    const response = Calendar.Events.list("primary", { maxResults: 100, pageToken });
    const events = response.items || [];
    for (const event of events) {
      if (event.eventType === "birthday") {
        Calendar.Events.remove("primary", event.id);
        total++;
      }
    }
    pageToken = response.nextPageToken;
  } while (pageToken);
  Logger.log(`Deleted ${total} birthday events from primary calendar.`);
}
