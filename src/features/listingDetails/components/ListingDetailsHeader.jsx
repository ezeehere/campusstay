import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import ShareListingButton from "../../../components/shared/ShareListingButton";

export default function ListingDetailsHeader({ listing }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8DFD2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-[#F6F1E8]"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <Link
          to="/"
          className="text-lg font-black tracking-tight text-[#070B1F]"
        >
          CampusStay
        </Link>

        <ShareListingButton listing={listing} />
      </div>
    </header>
  );
}
