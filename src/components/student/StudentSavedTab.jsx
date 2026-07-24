import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Heart, Loader2, Route, Trash2 } from "lucide-react";

import { getSavedListings, unsaveListing } from "../../firebase/savedListings";
import { getBestInstitutionDistanceInfo } from "../../utils/listingHelpers";

const RUPEE = "\u20B9";
const DOT = "\u00B7";

function StudentSavedTab({ studentUser, onBrowse }) {
  const navigate = useNavigate();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");

  async function loadSavedListings(uid) {
    if (!uid) {
      setSavedListings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const savedData = await getSavedListings(uid);
    setSavedListings(savedData);
    setLoading(false);
  }

  useEffect(() => {
    loadSavedListings(studentUser?.uid);
  }, [studentUser?.uid]);

  function handleViewDetails(savedItem) {
    if (!savedItem?.listingId) {
      alert("Listing details are not available.");
      return;
    }

    navigate(`/listing/${savedItem.listingId}`);
  }

  async function handleRemove(savedItem) {
    if (!studentUser?.uid) return;

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

  return (
    <section className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-3 shadow-sm sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#1F2933]">
            <Heart size={21} />
            Saved stays
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your shortlisted PGs and rooms.
          </p>
        </div>

        <p className="rounded-full bg-[#F1FAF7] px-4 py-2 text-sm font-bold text-[#1E5B4F]">
          {savedListings.length} saved
        </p>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center gap-3 rounded-3xl bg-[#FFF8EF] p-4 text-sm text-slate-600">
          <Loader2 className="animate-spin" size={18} />
          Loading saved stays...
        </div>
      ) : savedListings.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6F1E8] text-[#1E5B4F]">
            <Heart size={22} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-[#1F2933]">
            No saved stays yet.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Save listings you like and they will appear here.
          </p>
          <button
            type="button"
            onClick={onBrowse}
            className="mt-5 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
          >
            Browse all stays
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedListings.map((item) => {
            const distanceInfo = getBestInstitutionDistanceInfo(item);

            return (
            <article
              key={item.id}
              className="overflow-hidden rounded-[1.4rem] border border-[#E8DFD2] bg-white shadow-sm"
            >
              <div className="h-36 bg-[#F6F1E8] sm:h-40">
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

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-lg font-bold text-[#1F2933]">
                      {item.listingName || "Saved stay"}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                      {item.area || "Area not added"} {DOT} {item.type || "Stay"}
                    </p>
                    {distanceInfo && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-slate-500">
                        <Route size={14} className="mt-0.5 shrink-0 text-[#1E5B4F]" />
                        <span className="line-clamp-2">{distanceInfo.label}</span>
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 rounded-full bg-[#FFF4D8] px-3 py-1 text-xs font-bold text-[#8A5A00]">
                    {RUPEE}{item.rent || 0}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.verified && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      Verified
                    </span>
                  )}
                  {[item.gender, item.foodIncluded ? "Food included" : "No food"]
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-[#F6F1E8] px-2.5 py-1 text-xs font-bold text-slate-600"
                      >
                        {chip}
                      </span>
                    ))}
                </div>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewDetails(item)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
                  >
                    <Eye size={16} />
                    View details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={removingId === item.listingId}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removingId === item.listingId ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Remove from saved
                  </button>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default StudentSavedTab;