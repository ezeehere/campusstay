import { Link } from "react-router";

const sections = [
  {
    title: "1. About this Privacy Policy",
    body: "CampusStay respects student and user privacy. This Privacy Policy explains what information we collect, why we collect it, how we use it, and how users can contact us regarding their data.",
  },
  {
    title: "2. Information We Collect",
    items: [
      "Name",
      "Email address",
      "Phone number",
      "Institution or college preference",
      "Gender or stay suitability preference",
      "Budget range",
      "Preferred area or location near institution",
      "Stay type preference such as PG, hostel, room, or rental",
      "Food preference",
      "Room sharing preference",
      "Move-in timeline",
      "Saved listings",
      "Listing views and interactions",
      "Call, WhatsApp, and map click activity",
      "Contact or callback request details",
      "Reports submitted by users",
    ],
  },
  {
    title: "3. Why We Collect This Information",
    intro: "We collect this information to:",
    items: [
      "Show better PG and room recommendations",
      "Help students find suitable stays near institutions",
      "Help students contact property owners",
      "Notify students about relevant listings",
      "Improve listing quality and platform safety",
      "Understand student demand near institutions",
      "Help CampusStay verify, update, and manage listings",
      "Support students and property owners",
    ],
  },
  {
    title: "4. How We Use Student Activity Data",
    body: "CampusStay may record activity such as listing views, saved listings, call clicks, WhatsApp clicks, and map clicks. This helps us understand which listings are useful, improve recommendations, and provide better support.",
  },
  {
    title: "5. Data Sharing",
    paragraphs: [
      "CampusStay does not sell personal data.",
      "We may share limited contact or preference details with relevant property owners only when a student requests contact, callback, or shows clear interest in a listing.",
      "We may also share information if required by law or to prevent misuse of the platform.",
    ],
  },
  {
    title: "6. Payments",
    body: "CampusStay does not currently collect rent, deposit, or booking payments through the platform. Students and parents should verify the stay personally before making any payment directly to an owner.",
  },
  {
    title: "7. Data Security",
    body: "We try to protect user information using secure tools and access controls. However, no online platform can guarantee 100% security.",
  },
  {
    title: "8. User Responsibility",
    body: "Students should avoid sharing unnecessary sensitive information with owners or unknown persons. Students and parents should personally verify PGs, rooms, safety, rent, rules, and facilities before finalizing.",
  },
  {
    title: "9. Data Correction and Removal",
    body: "Users may contact CampusStay to request correction or removal of their profile or preference data, subject to platform safety, legal, and operational requirements.",
  },
  {
    title: "10. Children and Minors",
    body: "CampusStay is intended mainly for college students and admission-related users. If a user is below the legally required age, they should use the platform with parent or guardian guidance.",
  },
  {
    title: "11. Policy Updates",
    body: "CampusStay may update this Privacy Policy as the platform grows. The latest version will be available on the Privacy Policy page.",
  },
  {
    title: "12. Contact",
    body: "For privacy-related questions, users can contact CampusStay through the official contact details provided on the website.",
  },
];

function PrivacyPolicy() {
  return (
    <main className="cs-page min-h-screen px-3 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-[1.5rem] border border-[#E8DFD2] bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-8">
        <p className="w-fit rounded-full bg-[#F1FAF7] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#1E5B4F]">
          CampusStay
        </p>

        <h1 className="mt-4 text-3xl font-black text-[#1F2933] sm:text-4xl">
          CampusStay Privacy Policy
        </h1>

        <div className="mt-6 grid gap-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl bg-[#FFF8EF] p-4">
              <h2 className="text-lg font-bold text-[#1F2933]">{section.title}</h2>

              {section.intro && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {section.intro}
                </p>
              )}

              {section.body && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {section.body}
                </p>
              )}

              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-2 text-sm leading-6 text-slate-600">
                  {paragraph}
                </p>
              ))}

              {section.items && (
                <ul className="mt-2 grid gap-1.5 pl-5 text-sm leading-6 text-slate-600">
                  {section.items.map((item) => (
                    <li key={item} className="list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
        >
          Back to CampusStay
        </Link>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
