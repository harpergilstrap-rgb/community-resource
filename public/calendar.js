const calendarEvents = [];
const savedEventIds = new Set(JSON.parse(localStorage.getItem("common-ground-event-bookmarks") || "[]"));
const favoriteClubIds = new Set(JSON.parse(localStorage.getItem("common-ground-favorite-clubs") || "[]"));
const monthTitle = document.querySelector("#calendar-month-title");
const calendarGrid = document.querySelector("#calendar-grid");
const dayTitle = document.querySelector("#calendar-day-title");
const dayEvents = document.querySelector("#calendar-day-events");
const calendarStatus = document.querySelector("#calendar-status");
const savedToggle = document.querySelector("#calendar-saved-toggle");
const savedToggleLabel = document.querySelector("#calendar-saved-label");
const studentButton = document.querySelector("#student-demo-login");
const studentLogout = document.querySelector("#student-demo-logout");
const studentNote = document.querySelector("#student-note");
const studentForm = document.querySelector("#student-event-form");
const studentStatus = document.querySelector("#student-event-status");
const descriptionInput = document.querySelector("#student-description");
const descriptionCount = document.querySelector("#description-count");
const rsvpDialog = document.querySelector("#rsvp-dialog");
const rsvpForm = document.querySelector("#rsvp-form");
const rsvpStatus = document.querySelector("#rsvp-status");
let monthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDate = new Date();
let activeFilter = "all";
let savedOnly = false;
let studentSignedIn = false;

function localDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateKeyInCartersville(value) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function nthWeekday(year, month, weekday, occurrence) {
  const firstDay = new Date(year, month, 1).getDay();
  return 1 + ((weekday - firstDay + 7) % 7) + (occurrence - 1) * 7;
}

function lastWeekday(year, month, weekday) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return lastDay - ((new Date(year, month, lastDay).getDay() - weekday + 7) % 7);
}

function observedDate(year, month, day) {
  const date = new Date(Date.UTC(year, month, day));
  if (date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate() - 1);
  else if (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function federalHolidays(year) {
  const holidays = [
    ["New Year's Day", 0, 1],
    ["Martin Luther King Jr. Day", 0, nthWeekday(year, 0, 1, 3)],
    ["Washington's Birthday", 1, nthWeekday(year, 1, 1, 3)],
    ["Memorial Day", 4, lastWeekday(year, 4, 1)],
    ["Juneteenth National Independence Day", 5, 19],
    ["Independence Day", 6, 4],
    ["Labor Day", 8, nthWeekday(year, 8, 1, 1)],
    ["Indigenous Peoples' Day", 9, nthWeekday(year, 9, 1, 2)],
    ["Veterans Day", 10, 11],
    ["Thanksgiving Day", 10, nthWeekday(year, 10, 4, 4)],
    ["Christmas Day", 11, 25],
  ];
  return holidays.map(([name, month, day]) => {
    const actualDate = localDateKey(year, month, day);
    const workDate = observedDate(year, month, day);
    return {
      id: `holiday-${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      title: workDate === actualDate ? name : `${name} (observed)`,
      category: "holiday",
      dateKey: workDate,
      allDay: true,
      place: "United States",
      description: workDate === actualDate ? "U.S. federal holiday; employer schedules and closures may vary by organization." : `Observed work holiday; the calendar date is ${actualDate}. Employer closures may vary.`,
      source: "U.S. federal holiday calendar",
      status: "scheduled",
      rsvpCount: 0,
    };
  });
}

function allEventsForYear(year) {
  const holidays = federalHolidays(year);
  const listed = calendarEvents.filter((item) => item.status !== "deleted");
  return [...listed, ...holidays];
}

function eventDateKey(event) {
  return event.dateKey || dateKeyInCartersville(event.startsAt);
}

function eventsForDate(date) {
  const key = localDateKey(date.getFullYear(), date.getMonth(), date.getDate());
  return allEventsForYear(date.getFullYear()).filter((event) => {
    if (eventDateKey(event) !== key || event.status === "deleted") return false;
    const matchesFilter = activeFilter === "all"
      || (activeFilter === "my-clubs" ? Boolean(event.clubId && favoriteClubIds.has(event.clubId)) : event.category === activeFilter);
    if (!matchesFilter) return false;
    return !savedOnly || savedEventIds.has(event.id);
  });
}

function renderFavoriteCalendars() {
  if (activeFilter !== "my-clubs") return;
  const favoriteClubs = (window.communityClubs || []).filter((club) => favoriteClubIds.has(club.id));
  if (!favoriteClubs.length) return;
  const section = document.createElement("section");
  section.className = "calendar-opportunities";
  const heading = document.createElement("h4");
  heading.textContent = "Favorite clubs' published dates";
  section.append(heading);
  favoriteClubs.forEach((club) => {
    const link = document.createElement("a");
    link.href = club.calendar;
    link.textContent = `${club.title} dates ↗`;
    if (link.href.startsWith("https://")) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
    section.append(link);
  });
  dayEvents.append(section);
}

function announce(message, isError = false) {
  calendarStatus.textContent = message;
  calendarStatus.classList.toggle("error", isError);
}

function timeLabel(event) {
  if (event.allDay) return "All day";
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(event.startsAt));
}

function makeEventCard(event) {
  const card = document.createElement("article");
  card.className = `calendar-event-card ${event.category}`;
  const top = document.createElement("div");
  top.className = "calendar-event-top";
  const title = document.createElement("h4");
  title.textContent = event.title;
  const category = document.createElement("span");
  category.className = "calendar-category";
  const categoryLabels = { community: "Community", sport: "Sports & teams", club: "Club", volunteer: "Volunteer", holiday: "Work holiday" };
  category.textContent = categoryLabels[event.category] || "Community";
  top.append(title, category);
  const time = document.createElement("p");
  time.className = "calendar-event-meta";
  time.textContent = `${timeLabel(event)} · ${event.place}`;
  const description = document.createElement("p");
  description.className = "calendar-event-description";
  description.textContent = event.description;
  const actions = document.createElement("div");
  actions.className = "calendar-event-actions";

  if (event.category !== "holiday") {
    if (event.rsvpUrl) {
      const link = document.createElement("a");
      link.href = event.rsvpUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "RSVP / details ↗";
      link.className = "calendar-rsvp-link";
      link.setAttribute("aria-label", `RSVP or see details for ${event.title} on ${new URL(event.rsvpUrl).hostname}`);
      actions.append(link);
    } else {
      const rsvpButton = document.createElement("button");
      rsvpButton.type = "button";
      rsvpButton.className = "calendar-rsvp-link";
      rsvpButton.textContent = "RSVP";
      rsvpButton.addEventListener("click", () => openRsvp(event));
      actions.append(rsvpButton);
    }
    const bookmark = document.createElement("button");
    bookmark.type = "button";
    bookmark.className = "calendar-bookmark";
    bookmark.setAttribute("aria-pressed", String(savedEventIds.has(event.id)));
    bookmark.setAttribute("aria-label", `${savedEventIds.has(event.id) ? "Remove bookmark for" : "Bookmark"} ${event.title}`);
    bookmark.textContent = savedEventIds.has(event.id) ? "Saved" : "Bookmark";
    bookmark.addEventListener("click", () => toggleBookmark(event.id));
    actions.append(bookmark);
  }

  if (event.canManage && event.status === "scheduled") {
    for (const [status, label] of [["done", "Mark done"], ["deleted", "Delete"]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-manage";
      button.textContent = label;
      button.addEventListener("click", () => changeEventStatus(event.id, status));
      actions.append(button);
    }
  } else if (event.status === "done") {
    const badge = document.createElement("span");
    badge.className = "calendar-complete";
    badge.textContent = "Completed";
    actions.append(badge);
  }

  card.append(top, time, description, actions);
  return card;
}

function renderSelectedDay() {
  dayTitle.textContent = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(selectedDate);
  dayEvents.replaceChildren();
  const matches = eventsForDate(selectedDate);
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "calendar-empty";
    empty.textContent = savedOnly
      ? "No saved events on this day."
      : activeFilter === "my-clubs"
        ? favoriteClubIds.size ? "No published dates from your favorite groups on this day yet." : "Favorite a club on the clubs page to see its published dates here."
        : "Nothing listed for this day yet.";
    dayEvents.append(empty);
    renderFavoriteCalendars();
    return;
  }
  matches.sort((left, right) => left.allDay ? -1 : right.allDay ? 1 : new Date(left.startsAt) - new Date(right.startsAt));
  matches.forEach((event) => dayEvents.append(makeEventCard(event)));
  renderFavoriteCalendars();
}

function renderMonth() {
  monthTitle.textContent = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(monthCursor);
  calendarGrid.replaceChildren();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayRow = document.createElement("div");
  weekdayRow.className = "calendar-week calendar-weekdays";
  weekdays.forEach((weekday) => {
    const heading = document.createElement("span");
    heading.textContent = weekday;
    weekdayRow.append(heading);
  });
  calendarGrid.append(weekdayRow);

  const firstWeekday = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1).getDay();
  const firstVisibleDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1 - firstWeekday);
  for (let week = 0; week < 6; week += 1) {
    const row = document.createElement("div");
    row.className = "calendar-week";
    for (let day = 0; day < 7; day += 1) {
      const date = new Date(firstVisibleDate.getFullYear(), firstVisibleDate.getMonth(), firstVisibleDate.getDate() + week * 7 + day);
      const key = localDateKey(date.getFullYear(), date.getMonth(), date.getDate());
      const matchingEvents = eventsForDate(date);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-day";
      button.setAttribute("aria-pressed", String(localDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) === key));
      button.setAttribute("aria-label", `${new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(date)}${matchingEvents.length ? `, ${matchingEvents.length} listed ${matchingEvents.length === 1 ? "item" : "items"}` : ""}`);
      if (date.getMonth() !== monthCursor.getMonth()) button.classList.add("outside-month");
      if (key === localDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) button.classList.add("today");
      const number = document.createElement("span");
      number.className = "calendar-day-number";
      number.textContent = String(date.getDate());
      button.append(number);
      if (matchingEvents.length) {
        const markers = document.createElement("span");
        markers.className = "calendar-day-markers";
        markers.setAttribute("aria-hidden", "true");
        matchingEvents.slice(0, 3).forEach((event) => {
          const marker = document.createElement("i");
          marker.className = `marker-${event.category}`;
          markers.append(marker);
        });
        button.append(markers);
      }
      button.addEventListener("click", () => {
        selectedDate = date;
        if (date.getMonth() !== monthCursor.getMonth()) monthCursor = new Date(date.getFullYear(), date.getMonth(), 1);
        renderMonth();
        renderSelectedDay();
        window.applyCommunityLanguage?.();
      });
      row.append(button);
    }
    calendarGrid.append(row);
  }
  renderSelectedDay();
}

function toggleBookmark(id) {
  if (savedEventIds.has(id)) savedEventIds.delete(id);
  else savedEventIds.add(id);
  localStorage.setItem("common-ground-event-bookmarks", JSON.stringify([...savedEventIds]));
  savedToggleLabel.textContent = savedEventIds.size ? `Saved (${savedEventIds.size})` : "Saved events";
  renderMonth();
  window.applyCommunityLanguage?.();
}

async function fetchEvents() {
  try {
    const response = await fetch("/api/events", { cache: "no-store" });
    if (!response.ok) throw new Error("Community events are unavailable right now.");
    const result = await response.json();
    calendarEvents.splice(0, calendarEvents.length, ...result.events);
    announce(`${calendarEvents.length} community and school event listings loaded.`);
    renderMonth();
    window.applyCommunityLanguage?.();
  } catch (error) {
    announce(error.message, true);
    renderMonth();
  }
}

function openRsvp(event) {
  document.querySelector("#rsvp-event-id").value = event.id;
  document.querySelector("#rsvp-event-title").textContent = event.title;
  rsvpForm.reset();
  announceRsvp("");
  rsvpDialog.showModal();
    document.querySelector("#rsvp-close").focus();
}

function announceRsvp(message, isError = false) {
  rsvpStatus.textContent = message;
  rsvpStatus.classList.toggle("error", isError);
}

function wordCount(value) { return value.trim().split(/\s+/).filter(Boolean).length; }

descriptionInput.addEventListener("input", () => {
  descriptionCount.textContent = `${wordCount(descriptionInput.value)} / 10 words minimum`;
});

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = rsvpForm.querySelector("button[type=submit]");
  button.disabled = true;
  announceRsvp("Saving your RSVP...");
  try {
    const form = new FormData(rsvpForm);
      const response = await fetch(`/api/events/${encodeURIComponent(form.get("eventId"))}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save your RSVP.");
    announceRsvp(`You're on the list. ${result.rsvpCount} ${result.rsvpCount === 1 ? "neighbor has" : "neighbors have"} RSVP'd.`);
    await fetchEvents();
  } catch (error) { announceRsvp(error.message, true); }
  finally { button.disabled = false; }
});

document.querySelector("#rsvp-close").addEventListener("click", () => rsvpDialog.close());
rsvpDialog.addEventListener("click", (event) => { if (event.target === rsvpDialog) rsvpDialog.close(); });

document.querySelector("#calendar-prev").addEventListener("click", () => { monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1); selectedDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1); renderMonth(); });
document.querySelector("#calendar-next").addEventListener("click", () => { monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1); selectedDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1); renderMonth(); });
document.querySelector("#calendar-today").addEventListener("click", () => { selectedDate = new Date(); monthCursor = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1); renderMonth(); });

document.querySelectorAll("[data-calendar-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.calendarFilter;
    savedOnly = false;
    savedToggle.setAttribute("aria-pressed", "false");
    document.querySelectorAll("[data-calendar-filter]").forEach((filter) => filter.setAttribute("aria-pressed", String(filter === button)));
    renderMonth();
  });
});

savedToggle.addEventListener("click", () => {
  savedOnly = !savedOnly;
  savedToggle.setAttribute("aria-pressed", String(savedOnly));
  document.querySelectorAll("[data-calendar-filter]").forEach((filter) => filter.setAttribute("aria-pressed", String(filter.dataset.calendarFilter === "all")));
  renderMonth();
});

studentButton.addEventListener("click", async () => {
  studentButton.disabled = true;
  try {
    const response = await fetch("/api/student/demo-login", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Demo sign-in is unavailable.");
    studentSignedIn = true;
    studentButton.hidden = true;
    studentLogout.hidden = false;
    studentForm.hidden = false;
    studentNote.textContent = "Signed in as a local demo student. This is not a school-verified Microsoft account.";
    studentNote.classList.add("demo-warning");
    announce("Demo student session started. Submitted events are labeled school volunteer opportunities.");
    await fetchEvents();
  } catch (error) { studentNote.textContent = error.message; studentNote.classList.add("error"); }
  finally { studentButton.disabled = false; }
});

studentLogout.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  studentSignedIn = false;
  studentLogout.hidden = true;
  studentButton.hidden = false;
  studentForm.hidden = true;
  studentNote.textContent = "Student event creation is a local demo, not school-verified sign-in. No school credentials are collected.";
  await fetchEvents();
});

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = studentForm.querySelector("button[type=submit]");
  button.disabled = true;
  studentStatus.textContent = "Checking event details...";
  studentStatus.classList.remove("error");
  try {
    const form = new FormData(studentForm);
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.get("title"), startsAt: form.get("startsAt"), place: form.get("place"), description: form.get("description"), rsvpUrl: form.get("rsvpUrl") }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not publish the event.");
    studentForm.reset();
    descriptionCount.textContent = "0 / 10 words minimum";
    studentStatus.textContent = "Volunteer event added to the community calendar.";
    await fetchEvents();
    selectedDate = new Date(result.event.startsAt);
    monthCursor = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    renderMonth();
  } catch (error) {
    studentStatus.textContent = error.message;
    studentStatus.classList.add("error");
  } finally { button.disabled = false; }
});

async function changeEventStatus(id, status) {
  const response = await fetch(`/api/events/${encodeURIComponent(id)}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const result = await response.json();
  if (!response.ok) { announce(result.error || "Could not update the event.", true); return; }
  announce(status === "done" ? "Event marked as completed." : "Event deleted. Similar event submissions are now allowed.");
  await fetchEvents();
}

async function checkStudentSession() {
  try {
    const response = await fetch("/api/student/session", { cache: "no-store" });
    const session = await response.json();
    if (session.authenticated && session.demoOnly) {
      studentSignedIn = true;
      studentButton.hidden = true;
      studentLogout.hidden = false;
      studentForm.hidden = false;
      studentNote.textContent = "Signed in as a local demo student. This is not a school-verified Microsoft account.";
      studentNote.classList.add("demo-warning");
    }
  } catch { /* The public calendar remains readable if the session check is unavailable. */ }
}

savedToggleLabel.textContent = savedEventIds.size ? `Saved (${savedEventIds.size})` : "Saved events";
const requestedCalendarFilter = new URLSearchParams(location.search).get("calendar");
if (["all", "sport", "club", "volunteer", "community", "holiday", "my-clubs"].includes(requestedCalendarFilter)) {
  activeFilter = requestedCalendarFilter;
  document.querySelectorAll("[data-calendar-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.calendarFilter === activeFilter));
  });
}
renderMonth();
checkStudentSession();
fetchEvents();
