const BASE_URL = "https://www.campusstay.in";

export default async function handler(request, response) {
    const listingId = request.query.listingId;

    if (!listingId) {
        return sendFallback(response);
    }

    try {
        const projectId =
            process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

        const apiKey =
            process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;

        if (!projectId || !apiKey) {
            console.error("Missing Firebase project ID or API key.");
            return sendFallback(response);
        }

        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/listings/${encodeURIComponent(
            listingId
        )}?key=${apiKey}`;

        const firestoreResponse = await fetch(firestoreUrl);

        if (!firestoreResponse.ok) {
            console.error("Firestore fetch failed:", await firestoreResponse.text());
            return sendFallback(response);
        }

        const documentData = await firestoreResponse.json();
        const listing = normalizeFirestoreDocument(documentData);

        if (!listing || listing.approved !== true) {
            return sendFallback(response);
        }

        const listingUrl = `${BASE_URL}/listing/${encodeURIComponent(listingId)}`;
        const imageUrl = getListingImage(listing);
        const rent = listing.startingRent || listing.rent || 0;
        const seatsLeft = getTotalSeatsLeft(listing);
        const nearbyText = getNearbyText(listing);

        const title = `${listing.name || "PG/Room"} | CampusStay`;

        const description = [
            listing.area ? `Area: ${listing.area}` : "",
            rent ? `Rent starts from ₹${rent}/month` : "",
            seatsLeft > 0 ? `${seatsLeft} seats left` : "Currently fully booked",
            nearbyText ? `Near: ${nearbyText}` : "",
        ]
            .filter(Boolean)
            .join(" · ");

        const html = buildShareHtml({
            title,
            description:
                description ||
                "Find verified PGs and rooms near JIST with real photos, rent, seats left and direct owner contact.",
            imageUrl,
            listingUrl,
        });

        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.setHeader(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=3600"
        );

        return response.status(200).send(html);
    } catch (error) {
        console.error("Share page error:", error);
        return sendFallback(response);
    }
}

function buildShareHtml({ title, description, imageUrl, listingUrl }) {
    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const safeImageUrl = escapeHtml(imageUrl);
    const safeListingUrl = escapeHtml(listingUrl);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <meta name="robots" content="noindex, follow" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="CampusStay" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${safeListingUrl}" />
  <meta property="og:image" content="${safeImageUrl}" />
  <meta property="og:image:secure_url" content="${safeImageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImageUrl}" />

  <meta http-equiv="refresh" content="0;url=${safeListingUrl}" />

  <script>
    window.location.replace("${safeListingUrl}");
  </script>
</head>
<body>
  <p>Opening CampusStay listing...</p>
  <p>
    <a href="${safeListingUrl}">Click here if you are not redirected.</a>
  </p>
</body>
</html>`;
}

function sendFallback(response) {
    const fallbackUrl = `${BASE_URL}/`;
    const fallbackImage = `${BASE_URL}/og-campusstay.jpg`;

    const html = buildShareHtml({
        title: "CampusStay | Verified PGs and Rooms Near JIST",
        description:
            "Find verified PGs and rooms near JIST, JEC, Kaziranga ITI and nearby student areas.",
        imageUrl: fallbackImage,
        listingUrl: fallbackUrl,
    });

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    return response.status(200).send(html);
}

function normalizeFirestoreDocument(documentData) {
    const fields = documentData.fields || {};
    const result = {};

    Object.entries(fields).forEach(([key, value]) => {
        result[key] = parseFirestoreValue(value);
    });

    return result;
}

function parseFirestoreValue(value) {
    if ("stringValue" in value) return value.stringValue;
    if ("booleanValue" in value) return value.booleanValue;
    if ("integerValue" in value) return Number(value.integerValue);
    if ("doubleValue" in value) return Number(value.doubleValue);
    if ("timestampValue" in value) return value.timestampValue;
    if ("nullValue" in value) return null;

    if ("arrayValue" in value) {
        return (value.arrayValue.values || []).map(parseFirestoreValue);
    }

    if ("mapValue" in value) {
        const mapFields = value.mapValue.fields || {};
        const result = {};

        Object.entries(mapFields).forEach(([key, nestedValue]) => {
            result[key] = parseFirestoreValue(nestedValue);
        });

        return result;
    }

    return "";
}

function getListingImage(listing) {
    if (Array.isArray(listing.images) && listing.images.length > 0) {
        return listing.images[0];
    }

    return `${BASE_URL}/og-campusstay.jpg`;
}

function getTotalSeatsLeft(listing) {
    if (!Array.isArray(listing.roomOptions)) {
        return listing.available ? 1 : 0;
    }

    return listing.roomOptions.reduce(
        (total, room) => total + Number(room.availableUnits || 0),
        0
    );
}

function getNearbyText(listing) {
    if (
        Array.isArray(listing.nearbyInstitutions) &&
        listing.nearbyInstitutions.length > 0
    ) {
        return listing.nearbyInstitutions.join(", ");
    }

    return listing.nearbyInstitutionText || listing.nearbyCollege || "";
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}