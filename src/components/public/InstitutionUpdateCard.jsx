import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  MapPin,
  MessageCircle,
  SearchCheck,
} from "lucide-react";

import { teamMembers } from "../../utils/footerConfig";

const JEC_UPDATE_MESSAGE =
  "Hi CampusStay, I am looking for PG/room near JEC. Please notify me when new verified JEC listings are added.";

function getCampusStayWhatsAppLink() {
  const phone = String(teamMembers[0]?.phone || "").replace(/\D/g, "");
  const message = encodeURIComponent(JEC_UPDATE_MESSAGE);

  if (!phone) return `https://wa.me/?text=${message}`;

  return `https://wa.me/${phone}?text=${message}`;
}

const progressSteps = [
  {
    label: "Most listings are live",
    state: "done",
    icon: CheckCircle2,
  },
  {
    label: "More PG visits ongoing",
    state: "active",
    icon: MapPin,
  },
  {
    label: "Photos, rent and seat details being checked",
    state: "active",
    icon: ClipboardCheck,
  },
  {
    label: "Next update in 1-2 days",
    state: "active",
    icon: SearchCheck,
  },
];

function InstitutionUpdateCard({ listingCount = 6, listingSectionId = "available-stays" }) {
  const [expanded, setExpanded] = useState(false);
  const liveCount = Math.max(Number(listingCount) || 0, 6);

  function scrollToListings() {
    const listingSection = document.getElementById(listingSectionId);
    listingSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="mb-5 overflow-hidden rounded-[1.5rem] border border-[#DDECE7] bg-[#F1FAF7] shadow-sm sm:rounded-[2rem]">
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#1E5B4F] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white">
              {liveCount} live now
            </span>
            <span className="rounded-full border border-[#BFDAD2] bg-white px-3 py-1.5 text-xs font-bold text-[#1E5B4F]">
              Jorhat Engineering College
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-[#123C35] sm:text-3xl">
            JEC listings are live
          </h2>

          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-700">
            {liveCount} verified stays are available near JEC right now. We are visiting and checking more PGs and rooms, and new listings will be added within 1-2 days.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={scrollToListings}
              className="inline-flex items-center justify-center rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-black text-white transition hover:bg-[#123C35]"
            >
              View JEC listings
            </button>

            <a
              href={getCampusStayWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#BFDAD2] bg-white px-4 py-3 text-sm font-black text-[#1E5B4F] transition hover:bg-[#FFF8EF]"
            >
              <MessageCircle size={17} />
              Get WhatsApp updates
            </a>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-[#DDECE7] bg-white p-4">
          <div className="grid gap-3">
            {progressSteps.map((step) => {
              const Icon = step.icon;
              const completed = step.state === "done";

              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
                    completed
                      ? "border-[#1E5B4F] bg-[#F1FAF7]"
                      : "border-[#E8DFD2] bg-[#FFF8EF]"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      completed
                        ? "bg-[#1E5B4F] text-white"
                        : "bg-[#E5F4EF] text-[#1E5B4F]"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-black text-[#1F2933]">
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setExpanded((previous) => !previous)}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-[#DDECE7] bg-[#F1FAF7] px-4 py-3 text-left text-sm font-black text-[#123C35] transition hover:bg-[#E5F4EF]"
          >
            What are we checking?
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {expanded && (
            <p className="mt-3 rounded-2xl bg-[#FFF8EF] p-4 text-sm font-medium leading-6 text-slate-700">
              We check rent, room photos, food availability, seat count, owner contact, distance from JEC, and basic listing accuracy before adding more stays.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default InstitutionUpdateCard;