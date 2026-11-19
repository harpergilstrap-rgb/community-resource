# Common Ground: Design and Evaluation Report

## Planning and design

The audience is residents looking for local services, public events, recreation, or volunteer work, plus Cartersville High School students proposing school volunteer events. The main design problem is reducing the effort between “I need something” and a useful next step. The home page therefore leads with a local directory, keeps urgent referrals visible through 211, and groups the calendar and volunteer links as distinct tasks.

The site is a small page family with a shared header and footer: the home directory/calendar, a Mayor profile, and a Clubs & Teams directory. This separates public leadership information from participation tasks while keeping navigation consistent. Cards are used only for individual listings. The wide calendar changes to a stacked layout at tablet width, while its seven-column day grid remains stable and dates stay individually keyboard-operable.

The visual system pairs Manrope headings with DM Sans interface text for clear hierarchy. Deep green carries primary actions, lime marks selected or high-priority controls, and a light blue band separates event planning from the resource directory. The photographs depict Cartersville scenes but are illustrative and do not necessarily show the locations of the listed services. Motion is brief and disabled when the visitor requests reduced motion.

## Content and source decisions

City meeting entries link to their individual City of Cartersville calendar pages and ask visitors to confirm the venue. On November 18, 2026, the City pages for the [November 10 Planning Commission](https://www.cartersvillega.gov/Calendar.aspx?EID=847), [November 12 Board of Zoning Appeals](https://www.cartersvillega.gov/Calendar.aspx?EID=849), [November 17 Historic Preservation Commission](https://www.cartersvillega.gov/Calendar.aspx?EID=805), and [November 19 City Council](https://www.cartersvillega.gov/Calendar.aspx?EID=792) listed their dates, times, and the third floor of City Hall. Event details can change.

The calendar generates U.S. federal holidays by year, including observed weekday dates when the holiday falls on a weekend, based on the [U.S. Office of Personnel Management federal holiday schedule](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/). OPM uses the statutory name Columbus Day for the October holiday; the site uses the alternative name Indigenous Peoples' Day. An accompanying note explains that employers can set different closure schedules. The City calendar is linked for downtown events, office closures, and additional city listings.

Current 5K and running opportunities are linked to ACTIVE's Cartersville running directory; parade and festival announcements are linked to the City's Downtown Community Events calendar. These are discovery sources, not dated event records. No parade or 5K date, start time, venue, or registration was invented where an organizer had not published it.

The volunteer section links to [Cartersville Parks & Recreation's Pine Mountain volunteer page](https://www.cartersvillega.gov/300/Volunteer-Opportunities) and location-filtered volunteer searches for Rome and Emerson. The searches can include nearby towns, so visitors are asked to confirm the host address and travel distance.

The Mayor page summarizes the [City of Cartersville's published profile for Matt Santini](https://www.cartersvillega.gov/286/Mayor), including his mayoral tenure, education, professional background, cited public-service roles, official email, and office/mailing addresses. It omits unrelated family details and does not invent a direct phone number.

The Clubs & Teams page includes eight local sports, community, and school-volunteer listings. Every English description is exactly 50 words. The City's [basketball](https://www.cartersvillega.gov/303/Basketball-2026), [baseball](https://www.cartersvillega.gov/305/Boys-Baseball-2026), [softball](https://www.cartersvillega.gov/308/Girls-Softball-2026), and [adult programs](https://www.cartersvillega.gov/200/Adult-Programs) pages and individual club links are the primary sources. The basketball page lists 2026 evaluations for November 9 and 12 at 6:00 PM and lists locations as TBD; confirm with the organizer. Other 2026 signup periods shown by the City have closed; future dates are not guessed. Search directories and student demo submissions are not independently verified.

## Asset and rights documentation

Seven previously unverified stock photographs were replaced with Cartersville images from Wikimedia Commons. Each original file page identifies its creator and states that the copyright holder released it under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/); these statements were checked on November 19, 2026. Images are stored locally as resized Wikimedia thumbnails and may be cropped by the page layout. Photographs are illustrative, not confirmation of the location of a particular service.

| Placement | Original file and creator | Rights |
| --- | --- | --- |
| Hero | [Downtown Main Street, 2017](https://commons.wikimedia.org/wiki/File:Downtown_Main_Street_Cartersville,_Feb_2017.jpg), Thomson200 | CC0 1.0 |
| Parks card | [Dellinger Park, 2018](https://commons.wikimedia.org/wiki/File:Dellinger_Park,_Cartersville_GA_April_2018_1.jpg), Thomson200 | CC0 1.0 |
| Events card | [Downtown from Pine Mountain, 2015](https://commons.wikimedia.org/wiki/File:Downtown_Cartersville_viewed_from_Pine_Mountain,_April_2015.jpg), Thomson200 | CC0 1.0 |
| City services card | [Cartersville City Hall, 2015](https://commons.wikimedia.org/wiki/File:Cartersville_Georgia_City_Hall_2015.jpg), Thomson200 | CC0 1.0 |
| Community support card | [Cartersville Public Library, 2017](https://commons.wikimedia.org/wiki/File:Cartersville_Public_Library,_Cartersville,_GA_Dec_2017.jpg), Thomson200 | CC0 1.0 |
| Activities card | [Dellinger Park pavilion, 2018](https://commons.wikimedia.org/wiki/File:Dellinger_Park,_Cartersville_GA_April_2018_2.jpg), Thomson200 | CC0 1.0 |
| Facility reservations card | [Dellinger Park pavilion, 2023](https://commons.wikimedia.org/wiki/File:Dellinger_Park_pavillion.jpg), Clifflandis | CC0 1.0 |

The mayor portrait previously embedded from the City site has been replaced with a link to the official profile. The City's [copyright notice](https://www.cartersvillega.gov/copyright) reserves rights to site content; a link does not establish permission to reuse its images. The site's summaries are original wording based on cited sources.

The site loads [DM Sans](https://github.com/google/fonts/blob/main/ofl/dmsans/OFL.txt) (© The DM Sans Project Authors) and [Manrope](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt) (© The Manrope Project Authors) from Google Fonts; both are licensed under the SIL Open Font License 1.1. The Common Ground letter mark is drawn with site CSS, not a third-party logo. Names such as Microsoft, Unsplash, Rotary, and 211 identify their respective organizations or services; their appearance does not imply affiliation or endorsement. Links to external sites do not grant rights to reproduce their content or logos.

## Interaction and accessibility

- Calendar controls navigate months, jump to today, filter by sport/club/volunteer/community/holiday/favorite clubs, select a date, and show that day's events.
- Club favorites and event bookmarks persist in local storage on the visitor's device. Favorite-linked events appear under the My clubs filter. RSVP counts are stored as aggregate counts without attendee names or email addresses.
- Student event creation runs as an explicitly labeled local demo only. It is not Microsoft authentication, collects no school credentials, is disabled in production, and cannot access the coordinator inbox. A school tenant and application registration are required before real Microsoft sign-in can be enabled.
- New student events require a future Cartersville-local date and time, a place, and at least ten description words. The server validates these fields, allows only HTTPS RSVP links on a configured partner-host allowlist, and rejects similar active titles. The creator can mark an event done or deleted before a similar title is accepted.
- Microsoft Translator support is wired through server environment variables. Its language list is fetched from the provider, public text is translated as HTML, and known local names are marked as non-translatable. Without credentials, Spanish, French, and German translate selected interface text, the mayor's biography, and club descriptions; other text remains in English. The language preference is saved in browser storage when available. Message threads, inbox content, and form values are excluded from translation.
- Native buttons, visible focus rings, labeled forms, skip navigation, live status regions, `aria-expanded` and `aria-pressed` states, Escape-dismissable mobile menus, descriptive image text, and reduced-motion handling support keyboard and assistive-technology use. A shared top utility bar places language selection first and offers persistent larger-text, high-contrast, underline-link, and reduce-motion preferences.

Visible supporting text, labels, and controls use a 12px minimum, with display text larger. Representative WCAG contrast ratios calculated from the interface colors are 12.74:1 for primary text on the page background, 4.68:1 for muted text on that background, 5.41:1 for coral text on paper, 4.82:1 for coral on the blue section, 8.82:1 for dark green on lime, and 7.76:1 for white on green. The keyboard focus indicator includes a dark outer ring with 10.99:1 contrast against the page background. These calculations are targeted checks, not a full WCAG conformance audit.

## Implementation

The site is served by Node.js built-in HTTP modules; no package dependencies are required. The server provides JSON APIs for community events, demo-student submissions, RSVP counts, translation, and the private coordinator inbox. Data is written atomically to files outside the public directory with owner-only permissions. Same-origin checks, request limits, an RSVP host allowlist, a content security policy, and an authenticated `HttpOnly` admin session reduce avoidable exposure.

The home page uses responsive CSS media queries at 850px, 650px, 390px, and 360px; the Mayor and Clubs pages use a shared responsive subpage stylesheet. Resource cards, navigation, calendar controls, source links, and form patterns share the same type scale, spacing, focus treatment, and color tokens across all three pages.

## Verification

Playwright with headless Chromium checked the updated home, Mayor, and Clubs pages at 1440×900 desktop, 768×1024 tablet, 390×844 mobile, and 320×740 narrow mobile. The tested viewports had no horizontal overflow, and the visible-text audit found no text below 12px. Browser checks verified the official Mayor contact link, all eight 50-word descriptions, favorite-club navigation to the matching calendar event, persisted event bookmarks, published basketball evaluation details, and student demo sign-in. No uncaught browser errors were observed in these paths.

The event API was also exercised with a temporary database: it rejected unauthenticated submissions, descriptions shorter than ten words, unapproved RSVP hosts, and duplicate active titles; it allowed a replacement after completion; and it did not persist RSVP identity fields. The private inbox message/reply flow was tested separately with a disposable admin password and temporary storage.

These checks emulate viewport classes in Chromium; they do not prove compatibility on every operating system, browser engine, screen reader, or physical device. No production analytics or Core Web Vitals telemetry is configured.

## Success indicators

Targets below are proposed acceptance goals, not live-site measurements.

| Indicator | Target | Measurement method |
| --- | --- | --- |
| Responsive layout | Zero horizontal overflow at 320px, 390px, 768px, and 1440px | Automated browser viewport checks |
| Event submission quality | 100% of accepted submissions include valid time, place, 10+ words, and safe RSVP handling | API validation tests |
| Duplicate prevention | 100% of similar active event submissions are blocked until completion/deletion | Automated conflict test |
| Calendar task success | At least 4 of 5 moderated participants find an event and open its host page within 60 seconds | Usability task observation |
| Resource discovery | At least 4 of 5 participants find a relevant local starting point within 60 seconds | Usability task observation |
| Browser runtime | Zero uncaught JavaScript errors in the supported interaction paths | Playwright console/page-error checks |
| Core Web Vitals | At the 75th percentile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 | Measure after deployment with real-user monitoring or PageSpeed Insights; not currently measured |
| Translation coverage | All provider-supported language options translate public interface content after credentials are configured | Per-language smoke tests; private messages must remain excluded |

## Local run

```sh
node server.js
```

Open `http://localhost:4173`. Set a unique `ADMIN_PASSWORD` of at least 16 characters to enable private messages. For production, use HTTPS and set `NODE_ENV=production` and `PUBLIC_ORIGIN`. Configure `TRANSLATOR_KEY` and `TRANSLATOR_REGION` to enable provider-backed language selection. Student Microsoft login must remain disabled until a real Cartersville City Schools identity integration is supplied.
