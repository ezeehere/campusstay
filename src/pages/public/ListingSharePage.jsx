import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";

import { getListingById } from "../../firebase/listings";
import ListingDetailsModal from "../../components/public/ListingDetailsModal";
import ShareListingButton from "../../components/shared/ShareListingButton";

function ListingSharePage() {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notLive, setNotLive] = useState(false);

  useEffect(() => {
    async function loadListing() {
      try {
        setLoading(true);
        setNotLive(false);

        const data = await getListingById(listingId);

        if (!data || data.approved !== true) {
          setNotLive(true);
          return;
        }

        setListing(data);
      } catch (error) {
        console.error(error);
        setNotLive(true);
      } finally {
        setLoading(false);
      }
    }

    loadListing();
  }, [listingId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EF] px-4">
        <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#1E5B4F]" size={30} />
          <p className="mt-3 text-sm font-bold text-slate-600">
            Loading PG details...
          </p>
        </div>
      </main>
    );
  }

  if (notLive) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EF] px-4">
        <div className="max-w-md rounded-[2rem] border border-[#E8DFD2] bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-[#1E5B4F]">
            CampusStay
          </p>

          <h1 className="mt-3 text-2xl font-black text-slate-950">
            This listing is not live
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            This PG/room may be pending approval, removed, or not available
            publicly right now.
          </p>

          <Link
            to="/"
            className="mt-5 inline-flex rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-black text-white"
          >
            Browse live listings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8EF]">
      <header className="sticky top-0 z-30 border-b border-[#E8DFD2] bg-white/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-2 text-sm font-black text-slate-700"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <ShareListingButton listing={listing} variant="full" label="Share" />
        </div>
      </header>

      <ListingDetailsModal listing={listing} onClose={() => navigate("/")} />
    </main>
  );
}

export default ListingSharePage;
