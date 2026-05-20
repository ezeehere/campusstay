export function createWhatsAppLink(phone, listingName) {
  const message = `Hi, I found your listing on CampusStay. Is ${listingName} available?`;

  return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
}