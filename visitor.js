const VISITOR_COOKIE_NAME = "connect_friend_visitor";
const VISITOR_COOKIE_DAYS = 365;

function readVisitorCookie() {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${VISITOR_COOKIE_NAME}=`))
    ?.split("=")[1];
}

function writeVisitorCookie() {
  const now = new Date().toISOString();
  const current = readVisitorCookie();
  let visitor = {
    firstVisit: now,
    lastVisit: now,
    visits: 1
  };

  if (current) {
    try {
      visitor = JSON.parse(decodeURIComponent(current));
      visitor.lastVisit = now;
      visitor.visits = Number(visitor.visits || 0) + 1;
    } catch {
      visitor.lastVisit = now;
    }
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + VISITOR_COOKIE_DAYS);
  document.cookie = `${VISITOR_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(visitor))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  return visitor;
}

function rememberVisitor(options = {}) {
  const hasVisited = Boolean(readVisitorCookie());
  writeVisitorCookie();

  if (!hasVisited && options.redirectFirstVisitTo) {
    window.location.replace(options.redirectFirstVisitTo);
  }

  return hasVisited;
}
