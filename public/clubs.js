const clubGrid = document.querySelector("#club-grid");
const favoriteStatus = document.querySelector("#club-favorites-status");
const clubEventList = document.querySelector("#club-event-list");
const favoriteClubs = new Set(JSON.parse(localStorage.getItem("common-ground-favorite-clubs") || "[]"));
const savedEvents = new Set(JSON.parse(localStorage.getItem("common-ground-event-bookmarks") || "[]"));
let activeClubFilter = "all";

function announceFavorites() {
  const count = favoriteClubs.size;
  favoriteStatus.textContent = count ? `${count} favorite ${count === 1 ? "group" : "groups"}. Their published events appear under My clubs on the calendar.` : "Favorite a club to see its published dates under My clubs on the calendar.";
}

function buildClubCard(club) {
  const article = document.createElement("article");
  article.className = "club-card";
  article.dataset.category = club.category;
  article.dataset.clubId = club.id;
  const top = document.createElement("div");
  top.className = "club-card-top";
  const titleWrap = document.createElement("div");
  const kind = document.createElement("p");
  kind.className = "club-type";
  kind.textContent = club.group;
  const title = document.createElement("h3");
  title.textContent = club.title;
  titleWrap.append(kind, title);
  const favorite = document.createElement("button");
  favorite.type = "button";
  favorite.className = "favorite-club";
  favorite.setAttribute("aria-pressed", String(favoriteClubs.has(club.id)));
  favorite.setAttribute("aria-label", `${favoriteClubs.has(club.id) ? "Remove" : "Add"} ${club.title} ${favoriteClubs.has(club.id) ? "from" : "to"} favorites`);
  favorite.textContent = favoriteClubs.has(club.id) ? "Favorited" : "Favorite";
  favorite.addEventListener("click", () => {
    if (favoriteClubs.has(club.id)) favoriteClubs.delete(club.id);
    else favoriteClubs.add(club.id);
    localStorage.setItem("common-ground-favorite-clubs", JSON.stringify([...favoriteClubs]));
    renderClubs();
  });
  top.append(titleWrap, favorite);
  const description = document.createElement("p");
  description.className = "club-description";
  description.textContent = club.description;
  const status = document.createElement("p");
  status.className = "club-meta";
  status.textContent = club.status;
  const actions = document.createElement("div");
  actions.className = "club-actions";
  const joinLink = document.createElement("a");
  joinLink.href = club.signup;
  joinLink.className = "primary";
  joinLink.textContent = club.category === "volunteer" ? "Open opportunities" : "Join / signup ↗";
  if (joinLink.href.startsWith("https://")) { joinLink.target = "_blank"; joinLink.rel = "noopener noreferrer"; }
  const sourceLink = document.createElement("a");
  sourceLink.href = club.source;
  sourceLink.textContent = club.sourceLabel;
  if (sourceLink.href.startsWith("https://")) { sourceLink.target = "_blank"; sourceLink.rel = "noopener noreferrer"; }
  const calendarLink = document.createElement("a");
  calendarLink.href = club.calendar;
  calendarLink.textContent = "Published dates ↗";
  if (calendarLink.href.startsWith("https://")) { calendarLink.target = "_blank"; calendarLink.rel = "noopener noreferrer"; }
  const myCalendarLink = document.createElement("a");
  myCalendarLink.href = "/?calendar=my-clubs#calendar";
  myCalendarLink.textContent = "My clubs calendar ↗";
  actions.append(joinLink, sourceLink);
  if (club.calendar !== club.source) actions.append(calendarLink);
  actions.append(myCalendarLink);
  article.append(top, description, status, actions);
  return article;
}

function renderClubs() {
  clubGrid.replaceChildren();
  const visible = window.communityClubs.filter((club) => {
    if (activeClubFilter === "all") return true;
    if (activeClubFilter === "favorites") return favoriteClubs.has(club.id);
    return club.category === activeClubFilter;
  });
  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "club-empty";
    empty.textContent = activeClubFilter === "favorites" ? "No favorites yet. Choose a group and tap Favorite." : "No groups in this category yet.";
    clubGrid.append(empty);
  } else {
    visible.forEach((club) => clubGrid.append(buildClubCard(club)));
  }
  announceFavorites();
  window.applyCommunityLanguage?.();
}

function buildClubEvent(event) {
  const article = document.createElement("article");
  article.className = "club-event";
  const detail = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = event.title;
  const when = document.createElement("p");
  const date = new Date(event.startsAt);
  when.textContent = `${new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(date)} · ${event.place}`;
  const note = document.createElement("p");
  note.textContent = event.description;
  detail.append(title, when, note);
  const link = document.createElement("a");
  link.href = event.rsvpUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "RSVP / details ↗";
  link.setAttribute("aria-label", `RSVP or see details for ${event.title} on the City of Cartersville website`);
  const actions = document.createElement("div");
  actions.className = "club-actions";
  const calendarLink = document.createElement("a");
  calendarLink.href = "/?calendar=my-clubs#calendar";
  calendarLink.textContent = "Open My clubs calendar";
  const bookmark = document.createElement("button");
  bookmark.type = "button";
  bookmark.className = "favorite-club";
  bookmark.setAttribute("aria-pressed", String(savedEvents.has(event.id)));
  bookmark.setAttribute("aria-label", `${savedEvents.has(event.id) ? "Remove bookmark for" : "Bookmark"} ${event.title}`);
  bookmark.textContent = savedEvents.has(event.id) ? "Saved" : "Bookmark";
  window.applyCommunityLanguage?.();
  bookmark.addEventListener("click", () => {
    if (savedEvents.has(event.id)) savedEvents.delete(event.id);
    else savedEvents.add(event.id);
    localStorage.setItem("common-ground-event-bookmarks", JSON.stringify([...savedEvents]));
    bookmark.setAttribute("aria-pressed", String(savedEvents.has(event.id)));
    bookmark.setAttribute("aria-label", `${savedEvents.has(event.id) ? "Remove bookmark for" : "Bookmark"} ${event.title}`);
    bookmark.textContent = savedEvents.has(event.id) ? "Saved" : "Bookmark";
  });
  actions.append(link, calendarLink, bookmark);
  article.append(detail, actions);
  return article;
}

async function loadClubEvents() {
  try {
    const response = await fetch("/api/events", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error("Upcoming club dates are unavailable.");
    const upcoming = result.events.filter((event) => ["sport", "club"].includes(event.category) && event.status === "scheduled" && new Date(event.startsAt) >= new Date()).sort((left, right) => new Date(left.startsAt) - new Date(right.startsAt));
    clubEventList.replaceChildren();
    if (!upcoming.length) {
      const empty = document.createElement("p");
      empty.className = "club-empty";
      empty.textContent = "No future team dates have been published. Check the program links above for signup announcements.";
      clubEventList.append(empty);
      window.applyCommunityLanguage?.();
      return;
    }
    upcoming.forEach((event) => clubEventList.append(buildClubEvent(event)));
    window.applyCommunityLanguage?.();
  } catch (error) {
    const note = document.createElement("p");
    note.className = "club-empty";
    note.textContent = error.message;
    clubEventList.replaceChildren(note);
    window.applyCommunityLanguage?.();
  }
}

document.querySelectorAll("[data-club-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeClubFilter = button.dataset.clubFilter;
    document.querySelectorAll("[data-club-filter]").forEach((filter) => filter.setAttribute("aria-pressed", String(filter === button)));
    renderClubs();
  });
});

renderClubs();
loadClubEvents();
