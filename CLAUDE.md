# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Google Apps Script that reads all birthdays from Google Contacts (via the People API) and writes them as annually recurring all-day events into the primary Google Calendar. Sister project of [contacts-birthday-sheet](https://github.com/DasHasan/contacts-birthday-sheet).

## Useful commands (WSL)

To open the project in the browser:
```
explorer.exe "https://script.google.com/home/projects/1yt7SuZpmdt0qBp52wuB2zvJ15HiAReiocdqdtbbP2lhEkalrcmrJRibJ/edit"
```

To copy the script to the Windows clipboard:
```
cat birthday_to_calendar.gs | clip.exe
```

## Deployment and execution

There is no local build or test runner. The script runs entirely inside [script.google.com](https://script.google.com):

1. Paste `birthday_to_calendar.gs` into the script editor.
2. Enable the manifest via **Project settings → Show "appsscript.json"** and paste `appsscript.json`.
3. Select `syncBirthdaysToCalendar` from the function dropdown and click **Run**.
4. Approve the OAuth scopes (Contacts read + Calendar read/write) on first run.

Logs are visible in the **Execution log** panel and in Cloud Logging (Stackdriver).

## Architecture

`birthday_to_calendar.gs` contains all logic in four functions:

| Function | Role |
|---|---|
| `syncBirthdaysToCalendar` | Entry point: calls delete then create |
| `deletePrimaryBirthdayEvents` | Paginates all primary-calendar events and removes those with `eventType === "birthday"` |
| `fetchContactsWithBirthdays` | Paginates the People API, filters contacts that have a birthday date, returns `{name, birthday}` objects |
| `createBirthdayEvent` | Inserts a single all-day recurring event into the primary calendar |

Key design decisions:
- **Delete-then-recreate**: every run wipes all existing birthday events before rebuilding, so contact renames are always reflected correctly.
- **Name preference**: `fileAses[0].value` ("Speichern unter") is preferred over `names[0].displayName`.
- **Feb 29 handling**: uses `RRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1` so the event falls on Feb 28 in non-leap years.
- **Event title format**: `"[Name] Geburtstag"` (German).
- **Reminders**: three popup reminders per event — same day, 1 day before, and 1 week before.

## Advanced Services (`appsscript.json`)

Both services must be enabled in the Apps Script project settings before the script can run:

| Symbol | Service | Version |
|---|---|---|
| `Calendar` | Google Calendar API | v3 |
| `People` | People API | v1 |

Timezone is set to `Europe/Berlin`; change it in `appsscript.json` if needed.
