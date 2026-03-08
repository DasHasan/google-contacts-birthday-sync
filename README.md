# google-contacts-birthday-sync

Ein Google Apps Script, das alle Geburtstage aus Google Kontakte ausliest und als jahrlich wiederkehrende Ganztagesereignisse im Google Kalender anlegt.

Schwesterprojekt von [contacts-birthday-sheet](https://github.com/DasHasan/contacts-birthday-sheet), das Geburtstage stattdessen in eine Google Tabelle schreibt.

## Funktionen

- Liest alle Kontakte mit Geburtstag uber die People API
- Verwendet den "Speichern unter"-Namen, falls gesetzt, sonst den Anzeigenamen
- Loscht vor jedem Sync alle vorhandenen Geburtstagsereignisse und erstellt sie neu
- Legt Ganztagesereignisse mit dem Titel **"[Name] Geburtstag"** an
- Ereignisse werden direkt im primaren Kalender mit dem Typ `birthday` gespeichert
- Erinnerungen werden gemas den Standardeinstellungen des Kalenders gesetzt

## Einrichtung

1. [script.google.com](https://script.google.com) offnen und ein neues Projekt erstellen
2. Den Standardcode loschen und den Inhalt von `birthday_to_calendar.gs` einfugen
3. `appsscript.json` uber **Projekteinstellungen -> "appsscript.json"-Manifestdatei im Editor anzeigen"** offnen und den Inhalt der mitgelieferten `appsscript.json` einfugen
4. Funktion `syncBirthdaysToCalendar` im Dropdown auswahlen und auf **Ausfuhren** klicken
5. Die angeforderten Berechtigungen bestatigen (Zugriff auf Kontakte und Kalender)

## Funktionsubersicht

| Funktion | Beschreibung |
|---|---|
| `syncBirthdaysToCalendar` | Hauptfunktion - loscht alle Geburtstagsereignisse und erstellt sie neu |
| `deletePrimaryBirthdayEvents` | Loscht alle Geburtstagsereignisse aus dem primaren Kalender |

## Hinweise

- Geburtstage ohne Jahr werden trotzdem angelegt
- Bei jedem Ausfuhren werden alle Ereignisse geloscht und neu erstellt, um Umbenennung von Kontakten korrekt zu behandeln
- Die Zeitzone ist auf `Europe/Berlin` eingestellt und kann in der `appsscript.json` angepasst werden
