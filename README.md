# community-resource
# FBLA Web Design 2026-2027

See [PROJECT_REPORT.md](PROJECT_REPORT.md) for the planning rationale, implementation notes, accessibility choices, verification evidence, and success metrics.
The site also has a Sources & credits section documenting its photographs and their licenses; see the report for the full asset inventory.

## Pages

- `/` — community directory, calendar, volunteer links, and private messages.
- `/mayor` — official public biography and contact information for Mayor Matt Santini.
- `/clubs` — clubs, teams, signup links, and favorite controls. Each listing has a 50-word description.
## Run locally

This site uses Node.js built-in modules and has no package dependencies.

```sh
ADMIN_PASSWORD='use-a-unique-password-at-least-16-characters' node server.js
```

Open `http://localhost:4173`. Choose a unique admin password with at least 16 characters. Without it, the public site runs but the private message form and inbox stay disabled.

## Private messages

Messages are stored in `data/private-messages.json`, outside the public directory, with owner-only file permissions. Admin sign-in uses an `HttpOnly`, `SameSite=Strict` session cookie; message text is never stored in browser storage. The coordinator replies in the authenticated inbox. Senders return to their thread with a private link; anyone who has that link can read and reply, so treat it like a password. Replies appear in the thread and are not emailed.

For deployment, use HTTPS, set `NODE_ENV=production`, `ADMIN_PASSWORD` (16+ characters), and `PUBLIC_ORIGIN` to the site's HTTPS URL. Keep the `data` directory on private persistent storage with backups. Do not deploy the inbox on an untrusted shared host.

## Calendar and languages

The calendar includes current City of Cartersville meetings, published youth basketball evaluations, and generated U.S. federal holidays. It can filter by sport, club, volunteering, community, holiday, saved event, or favorite club. Favoriting a team or club adds its published events to the `My clubs` filter. The event finder links to the City downtown calendar and ACTIVE's Cartersville running listings; those searches are not dated RSVP events, so verify schedules with each organizer.

Set `TRANSLATOR_KEY` and `TRANSLATOR_REGION` to enable Microsoft Translator's supported-language list and public-page translation. Known local names are marked as non-translatable; private conversation threads, inbox content, and form values are excluded. Without those credentials, Spanish, French, and German translate selected interface text, the mayor's biography, and club descriptions, but other text remains in English. The selected language is saved in browser storage when available.

Cartersville High event creation is a clearly labeled local demo only. It does not authenticate through Microsoft or verify student identity, and is disabled in production until a real school identity integration is configured.

## Event links

The November 2026 meeting dates and times were checked against the City of Cartersville calendar. RSVP / details links open each meeting's official page. Some city entries do not publish a specific room; confirm venue and attendance requirements with the host.
