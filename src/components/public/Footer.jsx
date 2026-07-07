import { Link } from "react-router";
import { Home as HomeIcon } from "lucide-react";
import { launchData, teamMembers } from "../../utils/footerConfig";

export default function Footer() {
  return (
    <footer className="border-t border-[#E8DFD2] bg-[#FFF8EF]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-6 shadow-sm sm:p-8">
          {/* Main 4-Column Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_0.8fr_1.3fr]">
            {/*  Brand Intro */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white shadow-sm">
                  <HomeIcon size={23} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#1F2933]">
                    CampusStay
                  </h3>
                  <p className="text-sm text-slate-500">
                    PGs and rooms made easy
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                CampusStay helps students find verified PGs, boys PGs, girls
                PGs, and rooms for rent near JIST, JEC, Kaziranga ITI, Ayush
                Pharmacy, Sotai, and nearby Jorhat student areas.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-[#1E5B4F]">
                Quick links
              </h4>
              <div className="mt-4 grid gap-3 text-sm">
                <Link
                  to="/"
                  className="w-fit font-medium text-slate-600 transition hover:text-[#1E5B4F]"
                >
                  Home
                </Link>
                <Link
                  to="/submit-listing"
                  className="w-fit font-medium text-slate-600 transition hover:text-[#1E5B4F]"
                >
                  List your PG
                </Link>
                <Link
                  to="/check-status"
                  className="w-fit font-medium text-slate-600 transition hover:text-[#1E5B4F]"
                >
                  Check status
                </Link>
                <Link
                  to="/admin/login"
                  className="w-fit font-medium text-slate-600 transition hover:text-[#1E5B4F]"
                >
                  Admin
                </Link>
              </div>
            </div>

            {/* Launch Area  */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-[#1E5B4F]">
                Launch area
              </h4>
              <div className="mt-4 rounded-3xl bg-[#F6F1E8] p-4 border border-[#E8DFD2]/40">
                <p className="text-2xl font-extrabold text-[#1F2933] tracking-tight">
                  {launchData.title}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-600 font-medium">
                  {launchData.description}
                </p>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {launchData.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-[#FFF8EF] px-2.5 py-1 text-[10px] font-bold text-slate-500 border border-[#E8DFD2]/60 shadow-2xs"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/*  Dynamic Developers Connect Section */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-[#1E5B4F]">
                Connect With Us
              </h4>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {teamMembers.map((member) => (
                  <div
                    key={member.name}
                    className="rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF]/40 p-3.5 transition hover:bg-[#FFF8EF]/80 hover:shadow-2xs"
                  >
                    <p className="text-sm font-black text-[#1F2933]">
                      {member.name}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                      {member.role}
                    </p>

                    {/* Links Grid including Phone option */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
                      {/* 1. Phone Link (Tapping opens mobile dialer directly) */}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-1 hover:text-[#1E5B4F] transition"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          Call
                        </a>
                      )}

                      {/* 2. Email Link */}
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-1 hover:text-[#1E5B4F] transition"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Email
                      </a>

                      {/* 3. Instagram Link */}
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:text-[#F97316] transition"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="2"
                            y="2"
                            width="20"
                            height="20"
                            rx="5"
                            ry="5"
                          />
                          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                        Instagram
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-8 border-t border-[#E8DFD2] pt-5">
            <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl">
                Students and parents are advised to visit and verify the stay
                before making any payment.
              </p>
              <p className="shrink-0 font-medium">
                Designed & Built with ❤️ in Jorhat, Assam.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
