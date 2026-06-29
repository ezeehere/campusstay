import { Link, useSearchParams } from "react-router";
import { ArrowLeft, Home as HomeIcon, ShieldCheck } from "lucide-react";

import SubmitListingForm from "../../components/public/SubmitListingForm";

function SubmitListing() {
  const [searchParams] = useSearchParams();
  const ownerFirst = searchParams.get("ownerFirst") === "true";
  const activeRole = localStorage.getItem("campusstay_active_role");
  const isOwnerFlow = ownerFirst || activeRole === "owner";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF8EF] via-white to-[#F6F1E8] text-slate-950">
      <header className="border-b border-[#E8DFD2] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to={isOwnerFlow ? "/owner/dashboard" : "/"}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white shadow-sm">
              <HomeIcon size={22} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">
                CampusStay
              </h1>
              <p className="text-xs text-slate-500">
                PGs and rooms made easy
              </p>
            </div>
          </Link>

          <Link
            to={isOwnerFlow ? "/owner/dashboard" : "/"}
            className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#FFF8EF]"
          >
            <ArrowLeft size={16} />
            {isOwnerFlow ? "Dashboard" : "Back"}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <ShieldCheck size={16} />
              Admin review required
            </div>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              List your PG or room
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Submit the details below. The listing will be checked before it
              appears publicly on CampusStay.
            </p>
          </div>

          <SubmitListingForm ownerMode={isOwnerFlow} />
        </div>
      </section>
    </main>
  );
}

export default SubmitListing;