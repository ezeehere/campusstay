export const DOT = "\u00B7";
export const RUPEE = "\u20B9";

export const ACTIVITY_LABELS = {
  listing_view: "Viewed listing",
  view_details: "Viewed listing",
  view_listing: "Viewed listing",
  listing_viewed: "Viewed listing",
  save: "Saved listing",
  save_listing: "Saved listing",
  listing_saved: "Saved listing",
  unsave_listing: "Removed saved listing",
  share_click: "Shared listing",
  listing_share: "Shared listing",
  call_click: "Called owner",
  phone_click: "Called owner",
  whatsapp_click: "Opened WhatsApp",
  map_click: "Opened map",
  callback_request: "Requested callback",
  contact_request: "Requested contact",
  report_listing: "Reported listing",
};

export function normalizeDisplayText(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/\u00C2\u00B7/g, DOT)
    .replace(/\u00C3\u201A\u00C2\u00B7/g, DOT)
    .replace(/\u00C2(?=\s|$)/g, "")
    .trim();
}

export function normalizeActivityType(eventType) {
  return normalizeDisplayText(eventType).toLowerCase();
}

export function getActivityLabel(eventType) {
  const cleanEventType = normalizeActivityType(eventType);

  if (!cleanEventType) return "Activity";

  return (
    ACTIVITY_LABELS[cleanEventType] ||
    cleanEventType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

export function getActivitySubtitle(event) {
  const listingName = normalizeDisplayText(
    event?.listingName || event?.propertyName || event?.listingTitle || ""
  );
  const area = normalizeDisplayText(
    event?.area || event?.listingArea || event?.location || ""
  );
  const fallbackDescription = normalizeDisplayText(
    event?.description ||
      event?.subtitle ||
      event?.listingText ||
      event?.activityText ||
      ""
  );

  if (listingName && area) {
    if (listingName.includes(DOT)) return listingName;

    return [listingName, area].join(` ${DOT} `);
  }

  if (listingName) return listingName;
  if (area) return area;

  return fallbackDescription;
}