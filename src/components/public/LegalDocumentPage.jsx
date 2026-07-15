import { Link } from "react-router";

import Footer from "./Footer";
import { LEGAL_LAST_UPDATED } from "../../config/legal";

function LegalDocumentPage({ title, version, children }) {
  return (
    <div className="cs-page min-h-screen">
      <header className="border-b border-[#E8DFD2] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-black text-[#1E5B4F]">
            CampusStay
          </Link>

          <nav className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <Link className="transition hover:text-[#1E5B4F]" to="/terms">
              Terms
            </Link>
            <Link className="transition hover:text-[#1E5B4F]" to="/privacy">
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-4xl">
          <p className="w-fit rounded-full bg-[#F1FAF7] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#1E5B4F]">
            CampusStay Legal
          </p>

          <h1 className="mt-4 text-3xl font-black leading-tight text-[#1F2933] sm:text-4xl">
            {title}
          </h1>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-slate-500">
            <p>Last Updated: {LEGAL_LAST_UPDATED}</p>
            <p>Version: {version}</p>
          </div>

          <div className="mt-8 space-y-8 text-[15px] leading-7 text-slate-600">
            {children}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section className="border-t border-[#E8DFD2] pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-black text-[#1F2933]">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalSubheading({ children }) {
  return <h3 className="pt-2 text-base font-black text-[#1F2933]">{children}</h3>;
}

export function LegalList({ items }) {
  return (
    <ul className="space-y-1.5 pl-5">
      {items.map((item) => (
        <li key={item} className="list-disc">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function LegalContactBlock() {
  return (
    <p>
      <strong>CampusStay</strong>
      <br />
      Website:{" "}
      <a
        className="font-bold text-[#1E5B4F] underline"
        href="https://www.campusstay.in"
        target="_blank"
        rel="noreferrer"
      >
        https://www.campusstay.in
      </a>
      <br />
      Email:{" "}
      <a
        className="font-bold text-[#1E5B4F] underline"
        href="mailto:campusstayindia@gmail.com"
      >
        campusstayindia@gmail.com
      </a>
    </p>
  );
}

export default LegalDocumentPage;
