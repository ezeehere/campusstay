import { Link } from "react-router";

const sections = [
  {
    title: "1. About CampusStay",
    body: "CampusStay is a platform that helps students find PGs, rooms, and student accommodation near educational institutions.",
  },
  {
    title: "2. Listing Information",
    body: "CampusStay tries to keep listing information clear and updated, but rent, seats, food, facilities, and availability may change. Students and parents should confirm details with the owner.",
  },
  {
    title: "3. Verification",
    body: "Verified or approved listings mean the listing has been reviewed by CampusStay, but users should still visit and verify the place personally before making payment.",
  },
  {
    title: "4. Payments",
    body: "CampusStay does not currently collect rent, deposit, or booking payment through the platform. Users should be careful before making any advance payment directly to owners.",
  },
  {
    title: "5. Owner Contact",
    body: "Owner phone and WhatsApp details are provided so students can contact owners directly.",
  },
  {
    title: "6. User Responsibility",
    body: "Students and parents are responsible for checking safety, location, rules, and suitability before finalizing any stay.",
  },
  {
    title: "7. Reports",
    body: "Users can report wrong, fake, outdated, or misleading listing information. CampusStay may review, hide, or update such listings.",
  },
  {
    title: "8. Data Usage",
    body: "CampusStay may use student preference and activity data to show better recommendations, improve support, manage callbacks, and improve platform safety.",
  },
  {
    title: "9. Account and Misuse",
    body: "False information, fake reports, or misuse of the platform may lead to account restriction.",
  },
  {
    title: "10. Updates",
    body: "CampusStay may update these terms as the platform grows.",
  },
];

function Terms() {
  return (
    <main className="cs-page min-h-screen px-3 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-[1.5rem] border border-[#E8DFD2] bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-8">
        <p className="w-fit rounded-full bg-[#F1FAF7] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#1E5B4F]">
          CampusStay
        </p>

        <h1 className="mt-4 text-3xl font-black text-[#1F2933] sm:text-4xl">
          CampusStay Terms & Conditions
        </h1>

        <div className="mt-6 grid gap-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl bg-[#FFF8EF] p-4">
              <h2 className="text-lg font-bold text-[#1F2933]">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-6 rounded-2xl bg-[#F1FAF7] p-4 text-sm leading-6 text-slate-600">
          Please also read our{" "}
          <Link to="/privacy" className="font-bold text-[#1E5B4F] underline">
            Privacy Policy
          </Link>{" "}
          to understand how CampusStay collects and uses user data.
        </p>

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

export default Terms;
