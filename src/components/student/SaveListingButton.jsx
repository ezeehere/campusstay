import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Heart, Loader2 } from "lucide-react";
import { buildStudentLoginUrl, getCurrentReturnPath } from "../../utils/loginRedirect";

import { watchStudentAuth } from "../../firebase/studentAuth";
import {
  checkListingSaved,
  toggleSaveListing,
} from "../../firebase/savedListings";

function SaveListingButton({ listing, showText = true }) {
  const navigate = useNavigate();

  const [studentUser, setStudentUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = watchStudentAuth(async (user) => {
      setStudentUser(user);

      if (user && listing?.id) {
        const isSaved = await checkListingSaved(user.uid, listing.id);
        setSaved(isSaved);
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, [listing?.id]);

  async function handleSaveClick(event) {
    event.stopPropagation();

    if (!studentUser) {
      const returnTo = getCurrentReturnPath({
        openListing: listing.id,
      });

      navigate(
        buildStudentLoginUrl({
          returnTo,
          action: "save",
          listingId: listing.id,
        })
      );

      return;
    }

    try {
      setLoading(true);

      const newSavedState = await toggleSaveListing(studentUser.uid, listing);
      setSaved(newSavedState);
    } catch (error) {
      console.error(error);
      alert("Failed to update saved listing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSaveClick}
      disabled={loading || checking}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        saved
          ? "bg-[#1E5B4F] text-white hover:bg-[#123C35]"
          : "border border-[#E8DFD2] bg-white text-slate-700 hover:bg-[#F6F1E8]"
      }`}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <Heart size={16} className={saved ? "fill-white" : ""} />
      )}

      {showText ? (saved ? "Saved" : "Save") : null}
    </button>
  );
}

export default SaveListingButton;