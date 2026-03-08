# birthday-calendar-sync

A Google Apps Script that reads all your Google Contacts and their birthdays and creates recurring annual all-day events in Google Calendar.

Sister project of [contacts-birthday-sheet](https://github.com/DasHasan/contacts-birthday-sheet), which writes birthdays to a Google Sheet instead.

## Features

- Pulls all contacts with birthdays from Google Contacts via the People API
- Uses the "Speichern unter" (File as) name when set, otherwise falls back to the display name
- Creates all-day recurring annual events titled **"[Name]'s Birthday"**
- Skips contacts that already have an event — safe to run multiple times
- Writes events to a dedicated **Birthdays** calendar (created automatically if it doesn't exist)
- Each event description contains a sync tag (`[birthday-sync:resourceName]`) used for duplicate detection

## Setup

1. Open [Google Sheets](https://sheets.google.com) and create a new spreadsheet (needed to run Apps Script)
2. Go to **Extensions → Apps Script**
3. Delete the default code and paste the contents of `birthday_to_calendar.gs`
4. Click **Save**
5. Enable the People API: click **Services** (+ icon) → find **Google People API** → **Add**
6. Select `syncBirthdaysToCalendar` from the function dropdown and click **Run**
7. Grant the requested permissions when prompted (needs access to Contacts and Calendar)

## Configuration

At the top of the script:

```js
const CALENDAR_NAME = "Birthdays"; // Set to null to use your default calendar
```

## Functions

| Function | Description |
|---|---|
| `syncBirthdaysToCalendar` | Main function — fetches contacts and creates calendar events |
| `debugNameFields` | Logs raw API data for the first 20 contacts to inspect name fields |

## Notes

- If a birthday has no year set in Contacts, the event is still created (just without the birth year in the description)
- If a birthday has already passed this year, the first event occurrence is placed next year
- Re-running the script is safe — existing events are detected via the description tag and skipped
