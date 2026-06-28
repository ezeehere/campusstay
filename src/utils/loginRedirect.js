export function buildStudentLoginUrl({ returnTo = "/", action = "", listingId = "" }) {
  const params = new URLSearchParams();

  params.set("returnTo", returnTo);

  if (action) params.set("action", action);
  if (listingId) params.set("listingId", listingId);

  return `/student/login?${params.toString()}`;
}

export function getCurrentReturnPath(extraParams = {}) {
  const url = new URL(window.location.href);

  Object.entries(extraParams).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return `${url.pathname}${url.search}`;
}
