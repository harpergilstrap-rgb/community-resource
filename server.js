const { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } = require("node:crypto");
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, "data"));
const messageFile = path.join(dataDir, "private-messages.json");
const eventFile = path.join(dataDir, "community-events.json");
const port = Number(process.env.PORT || 4173);
const production = process.env.NODE_ENV === "production";
const adminPassword = process.env.ADMIN_PASSWORD || "";
const publicOrigin = process.env.PUBLIC_ORIGIN || "";
const translatorKey = process.env.TRANSLATOR_KEY || "";
const translatorRegion = process.env.TRANSLATOR_REGION || "";
const translatorEndpoint = process.env.TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com";
const passwordSalt = randomBytes(16);
const passwordHash = adminPassword ? scryptSync(adminPassword, passwordSalt, 32) : null;
const sessions = new Map();
const limits = new Map();
const sessionLifetime = 8 * 60 * 60 * 1000;
const maxBodyBytes = 12000;
let messages = [];
let events = [];
let writes = Promise.resolve();
let eventWrites = Promise.resolve();
let languageCache = { expiresAt: 0, languages: null };

const seedEvents = [
  {
    id: "cartersville-council-2026-11-05",
    title: "City Council Meeting",
    category: "community",
    startsAt: "2026-11-05T19:00:00-05:00",
    place: "Third floor of City Hall, Cartersville, GA 30120",
    description: "City Council considers municipal matters and public business during this regular city meeting.",
    rsvpUrl: "https://www.cityofcartersville.org/Calendar.aspx?EID=791",
    source: "City of Cartersville",
    status: "done",
    createdBy: "city",
    rsvps: [],
  },
  {
    id: "cartersville-planning-2026-11-10",
    title: "Planning Commission Meeting",
    category: "community",
    startsAt: "2026-11-10T17:30:00-05:00",
    place: "Cartersville, GA 30120; confirm venue on the official event page.",
    description: "The Planning Commission reviews local land-use requests and planning matters during this scheduled public meeting.",
    rsvpUrl: "https://www.cityofcartersville.org/Calendar.aspx?EID=847",
    source: "City of Cartersville",
    status: "scheduled",
    createdBy: "city",
    rsvps: [],
  },
  {
    id: "cartersville-zoning-2026-11-12",
    title: "Board of Zoning Appeals Meeting",
    category: "community",
    startsAt: "2026-11-12T17:30:00-05:00",
    place: "Cartersville, GA 30120; confirm venue on the official event page.",
    description: "The Board of Zoning Appeals reviews local zoning matters during this scheduled Cartersville public meeting.",
    rsvpUrl: "https://www.cityofcartersville.org/Calendar.aspx?EID=849",
    source: "City of Cartersville",
    status: "scheduled",
    createdBy: "city",
    rsvps: [],
  },
  {
    id: "cartersville-historic-preservation-2026-11-17",
    title: "Historic Preservation Commission Meeting",
    category: "community",
    startsAt: "2026-11-17T17:30:00-05:00",
    place: "Cartersville, GA 30120; confirm venue on the official event page.",
    description: "The Historic Preservation Commission discusses local preservation matters during this scheduled public meeting.",
    rsvpUrl: "https://www.cityofcartersville.org/Calendar.aspx?EID=805",
    source: "City of Cartersville",
    status: "scheduled",
    createdBy: "city",
    rsvps: [],
  },
  {
    id: "cartersville-council-2026-11-19",
    title: "City Council Meeting",
    category: "community",
    startsAt: "2026-11-19T19:00:00-05:00",
    place: "Cartersville, GA 30120; confirm venue on the official event page.",
    description: "City Council considers municipal matters and public business during this regular city meeting.",
    rsvpUrl: "https://www.cityofcartersville.org/Calendar.aspx?EID=792",
    source: "City of Cartersville",
    status: "scheduled",
    createdBy: "city",
    rsvps: [],
  },
  {
    id: "youth-basketball-8u-boys-evaluation-2026-11-09",
    title: "Youth Basketball 8U Boys Evaluation",
    category: "sport",
    clubId: "youth-basketball",
    startsAt: "2026-11-09T18:00:00-05:00",
    place: "Cartersville, GA 30120; evaluation gym not specified by the City.",
    description: "The City lists 8U boys basketball player evaluations at 6:00 PM; confirm the gym, age eligibility, and attendance details on the official program page before arriving.",
    rsvpUrl: "https://www.cartersvillega.gov/303/Basketball-2026",
    source: "City of Cartersville Parks & Recreation",
    status: "scheduled",
    createdBy: "city",
    rsvps: [],
  },
  {
    id: "youth-basketball-12u-boys-evaluation-2026-11-12",
    title: "Youth Basketball 12U Boys Evaluation",
    category: "sport",
    clubId: "youth-basketball",
    startsAt: "2026-11-12T18:00:00-05:00",
    place: "Cartersville, GA 30120; evaluation gym not specified by the City.",
    description: "The City lists 12U boys basketball player evaluations at 6:00 PM; confirm the gym, age eligibility, and attendance details on the official program page before arriving.",
    rsvpUrl: "https://www.cartersvillega.gov/303/Basketball-2026",
    source: "City of Cartersville Parks & Recreation",
    status: "scheduled",
    createdBy: "city",
    rsvps: [],
  },
];

function sendJson(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(value));
}

function headers(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' https://images.unsplash.com https://www.cartersvillega.gov; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'");
}

function inboxReady() {
  if (adminPassword.length < 16) return false;
  if (!production) return true;
  try { return new URL(publicOrigin).protocol === "https:"; } catch { return false; }
}

function sameOrigin(req) {
  if (req.headers.origin) {
    try {
      const origin = new URL(req.headers.origin);
      return publicOrigin ? origin.origin === new URL(publicOrigin).origin : origin.host === req.headers.host;
    } catch { return false; }
  }
  if (req.headers["sec-fetch-site"] !== "same-origin") return false;
  if (publicOrigin) {
    try { return req.headers.host === new URL(publicOrigin).host; } catch { return false; }
  }
  return !production;
}

async function jsonBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new Error("Request too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function limited(key, maximum, windowMs) {
  const now = Date.now();
  const recent = (limits.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= maximum) { limits.set(key, recent); return false; }
  recent.push(now);
  limits.set(key, recent);
  return true;
}

function ip(req) { return req.socket.remoteAddress || "unknown"; }
function hashToken(token) { return createHash("sha256").update(token).digest("hex"); }

function getThread(token) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) return null;
  const expected = Buffer.from(hashToken(token), "hex");
  return messages.find((item) => {
    const stored = Buffer.from(item.tokenHash, "hex");
    return stored.length === expected.length && timingSafeEqual(stored, expected);
  }) || null;
}

function bearer(req) {
  const value = req.headers.authorization || "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
}

function getSession(req) {
  const cookie = (req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("cg_admin="));
  const id = cookie?.slice("cg_admin=".length);
  const session = id && sessions.get(id);
  if (!session || session.expiresAt < Date.now()) {
    if (id) sessions.delete(id);
    return null;
  }
  session.expiresAt = Date.now() + sessionLifetime;
  return session;
}

function setCookie(res, value, maxAge) {
  res.setHeader("Set-Cookie", `cg_admin=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${production ? "; Secure" : ""}`);
}

function saveMessages() {
  writes = writes.then(async () => {
    const temp = `${messageFile}.${process.pid}.tmp`;
    await fs.writeFile(temp, JSON.stringify(messages, null, 2), { mode: 0o600 });
    await fs.chmod(temp, 0o600);
    await fs.rename(temp, messageFile);
    await fs.chmod(messageFile, 0o600);
  });
  return writes;
}

function publicThread(item) {
  return { id: item.id, name: item.name, messages: item.messages, createdAt: item.createdAt };
}

function replyMatch(pathname) { return pathname.match(/^\/api\/admin\/messages\/([a-f0-9-]+)\/reply$/); }

function saveEvents() {
  eventWrites = eventWrites.then(async () => {
    const temp = `${eventFile}.${process.pid}.tmp`;
    await fs.writeFile(temp, JSON.stringify(events, null, 2), { mode: 0o600 });
    await fs.chmod(temp, 0o600);
    await fs.rename(temp, eventFile);
    await fs.chmod(eventFile, 0o600);
  });
  return eventWrites;
}

function publicEvent(item, session) {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    startsAt: item.startsAt,
    place: item.place,
    description: item.description,
    clubId: item.clubId || null,
    rsvpUrl: item.rsvpUrl,
    source: item.source,
    status: item.status,
    rsvpCount: item.rsvpCount ?? item.rsvps.length,
    canManage: session?.role === "student" && session.studentId === item.createdBy,
  };
}

function titleSimilarity(left, right) {
  const normalize = (value) => value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const bigrams = (value) => {
    const compact = normalize(value).replace(/ /g, "");
    return new Set(Array.from({ length: Math.max(0, compact.length - 1) }, (_, index) => compact.slice(index, index + 2)));
  };
  const a = bigrams(left);
  const b = bigrams(right);
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  a.forEach((value) => { if (b.has(value)) overlap += 1; });
  return (2 * overlap) / (a.size + b.size);
}

function trustedRsvpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    const trustedHosts = new Set([
      "cityofcartersville.org",
      "cartersvillega.myrec.com",
      "romega.us",
      "idealist.org",
      "active.com",
      "runsignup.com",
      "eventbrite.com",
      "signupgenius.com",
      "forms.office.com",
      ...(process.env.RSVP_ALLOWED_HOSTS || "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean),
    ]);
    const hostAllowed = [...trustedHosts].some((host) => url.hostname.toLowerCase() === host || url.hostname.toLowerCase().endsWith(`.${host}`));
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443") || !hostAllowed) return null;
    return url.href;
  } catch { return null; }
}

function wordCount(value) { return value.trim().split(/\s+/).filter(Boolean).length; }

function parseCartersvilleDateTime(value) {
  const match = typeof value === "string" && value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const desired = Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText), Number(hourText), Number(minuteText));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  let timestamp = desired;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(timestamp)).filter((part) => part.type !== "literal").map(({ type, value: partValue }) => [type, Number(partValue)]));
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    timestamp = desired - (represented - timestamp);
  }
  const result = new Date(timestamp);
  const verified = Object.fromEntries(formatter.formatToParts(result).filter((part) => part.type !== "literal").map(({ type, value: partValue }) => [type, Number(partValue)]));
  if (verified.year !== Number(yearText) || verified.month !== Number(monthText) || verified.day !== Number(dayText) || verified.hour !== Number(hourText) || verified.minute !== Number(minuteText)) return null;
  return result;
}

function translatorConfigured() { return Boolean(translatorKey && translatorRegion); }

async function supportedLanguages() {
  if (!translatorConfigured()) return null;
  if (languageCache.languages && languageCache.expiresAt > Date.now()) return languageCache.languages;
  const response = await fetch(`${translatorEndpoint.replace(/\/$/, "")}/languages?api-version=3.0&scope=translation`, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Translation language list is unavailable.");
  const payload = await response.json();
  const languages = Object.entries(payload.translation || {}).map(([code, details]) => ({ code, name: details.name })).sort((a, b) => a.name.localeCompare(b.name));
  languageCache = { expiresAt: Date.now() + 60 * 60 * 1000, languages };
  return languages;
}

async function api(req, res, url) {
  if (url.pathname === "/api/session" && req.method === "GET") {
    const session = getSession(req);
    return sendJson(res, 200, { authenticated: session?.role === "admin", inboxConfigured: inboxReady() });
  }

  if (url.pathname === "/api/student/session" && req.method === "GET") {
    const session = getSession(req);
    return sendJson(res, 200, { authenticated: session?.role === "student", demoOnly: !production });
  }

  if (url.pathname === "/api/student/demo-login" && req.method === "POST") {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request origin not allowed." });
    if (production) return sendJson(res, 403, { error: "Demo student sign-in is disabled in production." });
    if (!limited(`student-demo:${ip(req)}`, 10, 60 * 60 * 1000)) return sendJson(res, 429, { error: "Please wait before trying demo sign-in again." });
    const id = randomBytes(32).toString("hex");
    sessions.set(id, { expiresAt: Date.now() + sessionLifetime, role: "student", studentId: randomUUID() });
    setCookie(res, id, sessionLifetime / 1000);
    return sendJson(res, 200, { authenticated: true, demoOnly: true, displayName: "Cartersville High School student (demo)" });
  }

  if (url.pathname === "/api/events" && req.method === "GET") {
    const session = getSession(req);
    const visibleEvents = events.filter((item) => item.status !== "deleted").map((item) => publicEvent(item, session));
    return sendJson(res, 200, { events: visibleEvents });
  }

  if (url.pathname === "/api/events" && req.method === "POST") {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request origin not allowed." });
    const session = getSession(req);
    if (production || session?.role !== "student") return sendJson(res, 401, { error: "Sign in to the local student demo to submit a school volunteer event." });
    try {
      const body = await jsonBody(req);
      const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "";
      const startsAt = parseCartersvilleDateTime(body.startsAt);
      const place = typeof body.place === "string" ? body.place.trim().slice(0, 180) : "";
      const description = typeof body.description === "string" ? body.description.trim().slice(0, 1200) : "";
      const rsvpUrl = body.rsvpUrl ? trustedRsvpUrl(body.rsvpUrl) : null;
      if (body.rsvpUrl && !rsvpUrl) return sendJson(res, 400, { error: "Use an HTTPS RSVP link from an approved partner, or leave it blank to use this site's RSVP form." });
      if (title.length < 4 || !startsAt || startsAt <= new Date() || place.length < 5 || wordCount(description) < 10) {
        return sendJson(res, 400, { error: "Add a title, future date and time, specific place, and description of at least 10 words." });
      }
      const duplicate = events.find((item) => item.status === "scheduled" && new Date(item.startsAt) > new Date() && titleSimilarity(title, item.title) >= 0.68);
      if (duplicate) return sendJson(res, 409, { error: `A similar event is still active: “${duplicate.title}”. It must be completed or deleted first.`, duplicateId: duplicate.id, duplicateTitle: duplicate.title });
      const item = {
        id: randomUUID(),
        title,
        category: "volunteer",
        startsAt: startsAt.toISOString(),
        place,
        description,
        rsvpUrl,
        source: "Cartersville High School student submission (demo)",
        scope: "school",
        clubId: "cartersville-high-volunteers",
        status: "scheduled",
        createdBy: session.studentId,
        rsvps: [],
      };
      events.push(item);
      await saveEvents();
      return sendJson(res, 201, { event: publicEvent(item, session) });
    } catch { return sendJson(res, 400, { error: "Could not save this event. Check the details and try again." }); }
  }

  const eventStatusMatch = url.pathname.match(/^\/api\/events\/([a-f0-9-]+)\/status$/);
  if (eventStatusMatch && req.method === "POST") {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request origin not allowed." });
    const session = getSession(req);
    if (production || session?.role !== "student") return sendJson(res, 401, { error: "Sign in to the student demo to manage your event." });
    try {
      const body = await jsonBody(req);
      const item = events.find((event) => event.id === eventStatusMatch[1]);
      if (!item || item.scope !== "school" || item.createdBy !== session.studentId) return sendJson(res, 404, { error: "You can only manage events created in this demo session." });
      if (!["done", "deleted"].includes(body.status)) return sendJson(res, 400, { error: "Choose done or deleted." });
      item.status = body.status;
      await saveEvents();
      return sendJson(res, 200, { event: publicEvent(item, session) });
    } catch { return sendJson(res, 400, { error: "Could not update this event." }); }
  }

  const rsvpMatch = url.pathname.match(/^\/api\/events\/([a-f0-9-]+)\/rsvp$/);
  if (rsvpMatch && req.method === "POST") {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request origin not allowed." });
    if (!limited(`rsvp:${ip(req)}`, 20, 60 * 60 * 1000)) return sendJson(res, 429, { error: "Please wait before submitting another RSVP." });
    try {
      const item = events.find((event) => event.id === rsvpMatch[1] && event.status === "scheduled");
      if (!item || item.rsvpUrl) return sendJson(res, 404, { error: "This event uses its official RSVP page instead." });
      item.rsvpCount = (item.rsvpCount ?? item.rsvps.length) + 1;
      item.rsvps = [];
      await saveEvents();
      return sendJson(res, 201, { rsvpCount: item.rsvpCount });
    } catch { return sendJson(res, 400, { error: "Could not save this RSVP." }); }
  }

  if (url.pathname === "/api/languages" && req.method === "GET") {
    if (!translatorConfigured()) return sendJson(res, 200, { configured: false, languages: [] });
    try { return sendJson(res, 200, { configured: true, languages: await supportedLanguages() }); }
    catch { return sendJson(res, 502, { configured: false, languages: [], error: "Translation languages are temporarily unavailable." }); }
  }

  if (url.pathname === "/api/translate" && req.method === "POST") {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request origin not allowed." });
    if (!translatorConfigured()) return sendJson(res, 503, { error: "Translation is not configured on this server yet." });
    if (!limited(`translate:${ip(req)}`, 120, 60 * 60 * 1000)) return sendJson(res, 429, { error: "Please slow down translation requests." });
    try {
      const body = await jsonBody(req);
      const target = typeof body.to === "string" ? body.to : "";
      const texts = Array.isArray(body.texts) ? body.texts : [];
      if (!/^[a-z]{2,3}(?:-[A-Za-z0-9-]+)?$/.test(target) || !texts.length || texts.length > 50 || texts.some((text) => typeof text !== "string" || text.length > 500) || texts.reduce((total, text) => total + text.length, 0) > 8000) {
        return sendJson(res, 400, { error: "Translation request is too large or invalid." });
      }
      const languages = await supportedLanguages();
      if (!languages.some((language) => language.code.toLowerCase() === target.toLowerCase())) return sendJson(res, 400, { error: "That language is not supported." });
      const response = await fetch(`${translatorEndpoint.replace(/\/$/, "")}/translate?api-version=3.0&to=${encodeURIComponent(target)}&textType=html`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": translatorKey, "Ocp-Apim-Subscription-Region": translatorRegion },
        body: JSON.stringify(texts.map((Text) => ({ Text }))),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) return sendJson(res, 502, { error: "The translation provider could not complete this request." });
      const translated = await response.json();
      return sendJson(res, 200, { texts: translated.map((item) => item.translations?.[0]?.text || "") });
    } catch { return sendJson(res, 502, { error: "Translation is temporarily unavailable." }); }
  }

  if (url.pathname === "/api/login" && req.method === "POST") {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request origin not allowed." });
    if (!inboxReady()) return sendJson(res, 503, { error: "Private inbox is not configured on this server yet." });
    if (!limited(`login:${ip(req)}`, 5, 15 * 60 * 1000)) return sendJson(res, 429, { error: "Too many sign-in attempts. Try again later." });
    try {
      const body = await jsonBody(req);
      const candidate = typeof body.password === "string" ? scryptSync(body.password, passwordSalt, 32) : Buffer.alloc(32);
      if (!timingSafeEqual(candidate, passwordHash)) return sendJson(res, 401, { error: "That password did not match." });
      const id = randomBytes(32).toString("hex");
      sessions.set(id, { expiresAt: Date.now() + sessionLifetime, role: "admin" });
      setCookie(res, id, sessionLifetime / 1000);
      return sendJson(res, 200, { authenticated: true });
    } catch { return sendJson(res, 400, { error: "Could not read the sign-in request." }); }
  }

  if (url.pathname === "/api/logout" && req.method === "POST") {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request origin not allowed." });
    const cookie = (req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("cg_admin="));
    if (cookie) sessions.delete(cookie.slice("cg_admin=".length));
    setCookie(res, "", 0);
    return sendJson(res, 200, { authenticated: false });
  }

  if (url.pathname === "/api/messages" && req.method === "POST") {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request origin not allowed." });
    if (!inboxReady()) return sendJson(res, 503, { error: "The private inbox is not configured yet. Your message was not sent." });
    if (!limited(`message:${ip(req)}`, 5, 60 * 60 * 1000)) return sendJson(res, 429, { error: "Please wait before sending another message." });
    try {
      const body = await jsonBody(req);
      if (typeof body.website === "string" && body.website.trim()) return sendJson(res, 400, { error: "Could not send this message." });
      const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
      const email = typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
      const text = typeof body.message === "string" ? body.message.trim() : "";
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || text.length < 5 || text.length > 3000) {
        return sendJson(res, 400, { error: "Add your name, a valid email address, and a message up to 3,000 characters." });
      }
      const token = randomBytes(32).toString("hex");
      const now = new Date().toISOString();
      const item = { id: randomUUID(), name, email, tokenHash: hashToken(token), createdAt: now, messages: [{ from: "neighbor", text, at: now }] };
      messages.unshift(item);
      await saveMessages();
      const origin = publicOrigin || `http://${req.headers.host || `localhost:${port}`}`;
      return sendJson(res, 201, { threadUrl: `${origin}/#thread=${token}` });
    } catch { return sendJson(res, 400, { error: "Could not send this message. Please try again." }); }
  }

  if (url.pathname === "/api/thread" && req.method === "GET") {
    const item = getThread(bearer(req));
    return item ? sendJson(res, 200, publicThread(item)) : sendJson(res, 404, { error: "This private conversation link is not valid." });
  }

  if (url.pathname === "/api/thread/reply" && req.method === "POST") {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request origin not allowed." });
    const item = getThread(bearer(req));
    if (!item) return sendJson(res, 404, { error: "This private conversation link is not valid." });
    if (!limited(`thread:${item.id}`, 20, 60 * 60 * 1000)) return sendJson(res, 429, { error: "Please wait before sending another reply." });
    try {
      const body = await jsonBody(req);
      const text = typeof body.message === "string" ? body.message.trim() : "";
      if (text.length < 2 || text.length > 3000) return sendJson(res, 400, { error: "Replies must be between 2 and 3,000 characters." });
      item.messages.push({ from: "neighbor", text, at: new Date().toISOString() });
      await saveMessages();
      return sendJson(res, 201, publicThread(item));
    } catch { return sendJson(res, 400, { error: "Could not send your reply. Please try again." }); }
  }

  if (url.pathname === "/api/admin/messages" && req.method === "GET") {
    if (getSession(req)?.role !== "admin") return sendJson(res, 401, { error: "Sign in to view the private inbox." });
    return sendJson(res, 200, messages.map(({ id, name, email, createdAt, messages: thread }) => ({ id, name, email, createdAt, messages: thread })));
  }

  const match = replyMatch(url.pathname);
  if (match && req.method === "POST") {
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request origin not allowed." });
    if (getSession(req)?.role !== "admin") return sendJson(res, 401, { error: "Sign in to reply to messages." });
    try {
      const body = await jsonBody(req);
      const text = typeof body.message === "string" ? body.message.trim() : "";
      const item = messages.find((message) => message.id === match[1]);
      if (!item) return sendJson(res, 404, { error: "Conversation not found." });
      if (text.length < 2 || text.length > 3000) return sendJson(res, 400, { error: "Replies must be between 2 and 3,000 characters." });
      item.messages.push({ from: "coordinator", text, at: new Date().toISOString() });
      await saveMessages();
      return sendJson(res, 201, { messages: item.messages });
    } catch { return sendJson(res, 400, { error: "Could not send this reply. Please try again." }); }
  }

  return sendJson(res, 404, { error: "Not found." });
}

async function handle(req, res) {
  headers(res);
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${port}`}`);
  if (url.pathname.startsWith("/api/")) return api(req, res, url);
  const scripts = {
    "/calendar.js": "calendar.js",
    "/languages.js": "languages.js",
    "/accessibility.js": "accessibility.js",
    "/clubs-data.js": "clubs-data.js",
    "/clubs.js": "clubs.js",
  };
  if (req.method === "GET" && scripts[url.pathname]) {
    try {
      const script = await fs.readFile(path.join(root, "public", scripts[url.pathname]));
      res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-cache" });
      return res.end(script);
    } catch { return sendJson(res, 404, { error: "Not found." }); }
  }
  if (req.method === "GET" && url.pathname === "/subpages.css") {
    try {
      const stylesheet = await fs.readFile(path.join(root, "public", "subpages.css"));
      res.writeHead(200, { "Content-Type": "text/css; charset=utf-8", "Cache-Control": "no-cache" });
      return res.end(stylesheet);
    } catch { return sendJson(res, 404, { error: "Not found." }); }
  }
  const images = new Set([
    "/images/downtown.jpg",
    "/images/dellinger-park.jpg",
    "/images/pine-mountain-view.jpg",
    "/images/city-hall.jpg",
    "/images/library.jpg",
    "/images/dellinger-park-activities.jpg",
    "/images/park-pavilion.jpg",
  ]);
  if (req.method === "GET" && images.has(url.pathname)) {
    try {
      const image = await fs.readFile(path.join(root, "public", url.pathname.slice(1)));
      res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "no-cache" });
      return res.end(image);
    } catch { return sendJson(res, 500, { error: "The image could not be loaded." }); }
  }
  const pages = {
    "/": "index.html",
    "/index.html": "index.html",
    "/mayor": "mayor.html",
    "/mayor.html": "mayor.html",
    "/clubs": "clubs.html",
    "/clubs.html": "clubs.html",
  };
  if (req.method === "GET" && pages[url.pathname]) {
    try {
      const html = await fs.readFile(path.join(root, "public", pages[url.pathname]));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      return res.end(html);
    } catch { return sendJson(res, 500, { error: "The site could not be loaded." }); }
  }
  return sendJson(res, 404, { error: "Not found." });
}

async function start() {
  await fs.mkdir(dataDir, { recursive: true, mode: 0o700 });
  try {
    messages = JSON.parse(await fs.readFile(messageFile, "utf8"));
    if (!Array.isArray(messages)) throw new Error("Invalid private inbox file.");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await fs.writeFile(messageFile, "[]", { mode: 0o600 });
    await fs.chmod(messageFile, 0o600);
  }
  try {
    const storedEvents = JSON.parse(await fs.readFile(eventFile, "utf8"));
    if (!Array.isArray(storedEvents)) throw new Error("Invalid community events file.");
    events = [...seedEvents, ...storedEvents.filter((item) => item.createdBy !== "city")];
    await saveEvents();
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    events = seedEvents;
    await saveEvents();
  }
  const server = http.createServer((req, res) => {
    handle(req, res).catch(() => {
      if (!res.headersSent) sendJson(res, 500, { error: "The request could not be completed." });
      else res.destroy();
    });
  });
  server.listen(port, "0.0.0.0", () => {
    console.log(`Community guide listening on http://localhost:${port}`);
    if (!inboxReady()) console.log("Private inbox is disabled until ADMIN_PASSWORD is set (16+ characters).");
    if (!translatorConfigured()) console.log("Automatic languages are disabled until TRANSLATOR_KEY and TRANSLATOR_REGION are set.");
    if (production) console.log("Student event creation is disabled because only the local demo sign-in is implemented.");
  });
}

start().catch((error) => {
  console.error("Could not start community guide:", error.message);
  process.exitCode = 1;
});
