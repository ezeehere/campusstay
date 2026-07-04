import { Search } from "lucide-react";

export function HighlightSticker({ children, color = "green" }) {
  const bgColor = color === "yellow" ? "bg-[#FFE45C]" : "bg-[#42B66B]";
  return (
    <span className="relative inline-flex rotate-[-3deg] px-2 py-0.5 sm:px-3 sm:py-1">
      <span
        className={`absolute inset-0 -z-10 ${bgColor}`}
        style={{
          clipPath: "polygon(2% 8%, 98% 0%, 96% 92%, 5% 100%, 0% 45%)",
        }}
      />
      <span className="relative z-10 font-black text-[#03071F]">{children}</span>
    </span>
  );
}

function HeroTrustPill({ children }) {
  return (
    <span className="rounded-full border border-[#E8DFD2] bg-white/80 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function HeroPreviewCard() {
  return (
    <div className="relative hidden lg:block">
      <div className="absolute -left-8 top-10 z-20">
        <HeroTrustPill>Updated seats</HeroTrustPill>
      </div>
      <div className="absolute -right-5 bottom-12 z-20">
        <HeroTrustPill>Direct owner contact</HeroTrustPill>
      </div>
      <div className="rounded-[2.2rem] border border-[#E8DFD2] bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="rounded-[1.7rem] bg-[#070B1F] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-black text-white">Quick stay preview</p>
            <span className="rounded-full bg-[#E9FFF4] px-3 py-1 text-xs font-black text-[#16845A]">
              Verified
            </span>
          </div>
          <div className="h-52 overflow-hidden rounded-[1.5rem] bg-[#FFF8EF]">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
              alt="Room preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-4 rounded-[1.5rem] bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-[#03071F]">Student stay near JIST</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Sotai · Near JIST and nearby student areas
                </p>
              </div>
              <p className="text-right text-lg font-black text-[#03071F]">
                ₹3,000
                <span className="block text-[10px] font-bold text-slate-400">month</span>
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["8 seats left", "Food available", "Wi-Fi", "Move-in: Ask"].map((feat) => (
                <div key={feat} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteLineBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
      <svg viewBox="0 0 1200 500" className="absolute left-0 top-0 h-full w-full" fill="none">
        <path
          d="M80 420 C250 300, 330 360, 480 240 C620 130, 760 170, 900 90 C1010 30, 1080 80, 1160 40"
          stroke="#F97316"
          strokeWidth="3"
          strokeDasharray="10 14"
          strokeLinecap="round"
        />
        <circle cx="80" cy="420" r="7" fill="#1E5B4F" />
        <circle cx="480" cy="240" r="7" fill="#1E5B4F" />
        <circle cx="900" cy="90" r="7" fill="#1E5B4F" />
      </svg>
    </div>
  );
}

export default function HeroSection({ search, setSearch, gender, setGender, type, setType, foodFilter, setFoodFilter, totalListings }) {
  return (
    <section className="relative overflow-hidden border-b border-[#E8DFD2] bg-[#FFF8EF]">
      <RouteLineBackground />
      <div className="pointer-events-none absolute -right-24 bottom-[-140px] h-72 w-72 rounded-full bg-[#FF7A1A]/20" />
      <div className="pointer-events-none absolute -right-10 bottom-[-90px] h-52 w-52 rounded-full bg-[#42B66B]/20" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-5 pt-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-14 lg:pt-12">
        <div>
          <div>
            <div className="mb-3 inline-flex rounded-full border border-[#E8DFD2] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-wide text-[#1E5B4F] shadow-sm">
              No broker fee for students
            </div>
            <h1 className="max-w-3xl text-[2.35rem] font-black leading-[1.03] tracking-[-0.055em] text-[#03071F] sm:text-6xl lg:text-7xl">
              Find verified PGs and rooms near <HighlightSticker color="green">JIST</HighlightSticker>
            </h1>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-slate-600 sm:text-lg sm:leading-7">
              Real photos, updated seats, clear charges, and direct owner contact.
            </p>
            <div className="mt-4 hidden flex-wrap items-center gap-2 text-sm sm:flex">
              <span className="font-bold text-slate-500">Made for</span>
              {["JIST", "JEC", "Kaziranga ITI", "Ayush Pharmacy"].map((item) => (
                <span key={item} className="rounded-full border border-[#E8DFD2] bg-white px-3 py-1.5 text-xs font-black text-[#03071F] shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl border border-[#E8DFD2] bg-white p-3 shadow-sm sm:p-4">
              <p className="text-xl font-black text-[#03071F] sm:text-2xl">{totalListings}+</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500 sm:text-xs">Stays listed</p>
            </div>
            <div className="rounded-2xl border border-[#E8DFD2] bg-white p-3 shadow-sm sm:p-4">
              <p className="text-xl font-black text-[#03071F] sm:text-2xl">4</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500 sm:text-xs">Student areas</p>
            </div>
            <div className="rounded-2xl border border-[#E8DFD2] bg-white p-3 shadow-sm sm:p-4">
              <p className="text-xl font-black text-[#03071F] sm:text-2xl">0</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500 sm:text-xs">Broker fee</p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-[#E8DFD2] bg-white/95 p-2 shadow-sm backdrop-blur sm:mt-7 sm:rounded-[2rem] sm:p-3">
            <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 sm:rounded-[1.5rem] sm:py-4">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PG, area, institution..."
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 sm:mt-3">
              {["Boys", "Girls", "PG", "Room", "Food included"].map((chip) => {
                let isActive = false;
                let clickHandler = () => {};

                if (chip === "Boys") {
                  isActive = gender === "Boys";
                  clickHandler = () => setGender(gender === "Boys" ? "all" : "Boys");
                } else if (chip === "Girls") {
                  isActive = gender === "Girls";
                  clickHandler = () => setGender(gender === "Girls" ? "all" : "Girls");
                } else if (chip === "PG") {
                  isActive = type === "PG";
                  clickHandler = () => setType(type === "PG" ? "all" : "PG");
                } else if (chip === "Room") {
                  isActive = type === "Room";
                  clickHandler = () => setType(type === "Room" ? "all" : "Room");
                } else if (chip === "Food included") {
                  isActive = foodFilter === "included";
                  clickHandler = () => setFoodFilter(foodFilter === "included" ? "all" : "included");
                }

                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={clickHandler}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                      isActive ? "border-slate-950 bg-slate-950 text-white" : "border-[#E8DFD2] bg-white text-slate-700 hover:bg-[#F6F1E8]"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <HeroPreviewCard />
      </div>
    </section>
  );
}