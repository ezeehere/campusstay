import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Heart,
  Home as HomeIcon,
  Loader2,
  Trash2,
} from "lucide-react";

import { watchStudentAuth } from "../../firebase/studentAuth";
import {
  getSavedListings,
  unsaveListing,
} from "../../firebase/savedListings";

function StudentSavedListings() {
  const [studentUser, setStudentUser] = useState(null);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");

  async function loadSavedListings(uid) {
    const savedData = await getSavedListings(uid);
    setSavedListings(savedData);
  }

  useEffect(() => {
    const unsubscribe = watchStudentAuth(async (user) => {
      setStudentUser(user);

      if (user) {
        await loadSavedListings(user.uid);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleRemove(savedItem) {
    if (!studentUser) return;

    try {
      setRemovingId(savedItem.listingId);
      await unsaveListing(studentUser.uid, savedItem.listingId);
      await loadSavedListings(studentUser.uid);
    } catch (error) {
      console.error(error);
      alert("Failed to remove saved listing.");
    } finally {
      setRemovingId("");
    }
  }

  if (loading) {
    return (
      <main className="cs-page flex min-h-screen items-center justify-center px-3 py-4 text-slate-600">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm">
          <Loader2 className="animate-spin" size={20} />
          Loading saved listings...
        </div>
      </main>
    );
  }

  return (
    <main className="cs-page min-h-screen px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl overflow-x-hidden">
        <header className="flex flex-col gap-4 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:rounded-[2rem] sm:p-6">
          <div>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#1E5B4F]"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>

            <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-[#1F2933]">
              <Heart size={24} />
              Saved PGs and Rooms
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              These are the listings you saved while browsing CampusStay.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#123C35]"
          >
            <HomeIcon size={16} />
            Browse listings
          </Link>
        </header>

        {savedListings.length === 0 ? (
          <section className="mt-5 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-6 text-center shadow-sm sm:rounded-[2rem] sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6F1E8] text-[#1E5B4F]">
              <Heart size={24} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#1F2933]">
              No saved listings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Open any PG or room listing and click Save to add it here.
            </p>

            <Link
              to="/"
              className="mt-5 inline-flex rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
            >
              Browse PGs and rooms
            </Link>
          </section>
        ) : (
          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedListings.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[2rem] border border-[#E8DFD2] bg-white shadow-sm"
              >
                <div className="aspect-[4/3] bg-[#F6F1E8]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.listingName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-[#1F2933]">
                        {item.listingName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.area} · {item.type}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#FFF4D8] px-3 py-1 text-xs font-bold text-[#8A5A00]">
                      ₹{item.rent}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.verified && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Verified
                      </span>
                    )}

                    <span className="rounded-full bg-[#F6F1E8] px-3 py-1 text-xs font-bold text-slate-600">
                      {item.gender}
                    </span>

                    <span className="rounded-full bg-[#F6F1E8] px-3 py-1 text-xs font-bold text-slate-600">
                      {item.foodIncluded ? "Food included" : "No food"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={removingId === item.listingId}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removingId === item.listingId ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Remove from saved
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default StudentSavedListings;