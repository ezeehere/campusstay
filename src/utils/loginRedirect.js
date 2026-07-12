export function getSafeReturnPath(returnTo, fallback = "/student/dashboard") {
  if (!returnTo) return fallback;

  const value = String(returnTo).trim();

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return fallback;
  }

  return value;
}

export function buildStudentLoginUrl({
  returnTo = "/student/dashboard",
  action = "",
  listingId = "",
}) {
  const params = new URLSearchParams();

  params.set("returnTo", getSafeReturnPath(returnTo));

  if (action) params.set("action", action);
  if (listingId) params.set("listingId", listingId);

  return `/student/login?${params.toString()}`;
}

export function getCurrentReturnPath(extraParams = {}) {
  const url = new URL(window.location.href);

  Object.entries(extraParams).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return getSafeReturnPath(`${url.pathname}${url.search}${url.hash}`, "/");
}
