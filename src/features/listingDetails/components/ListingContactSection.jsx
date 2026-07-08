import { MapPin } from "lucide-react";
import { auth } from "../../../firebase/config";
import ProtectedContactActions from "../../../components/public/ProtectedContactActions";

function SectionCard({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-black text-[#070B1F]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function ListingContactSection({
  listing,
  mapLink,
  requireStudentLogin,
  handleAnalyticsClick,
}) {
  return (
    <div className="space-y-5">
      <SectionCard title="Contact numbers">
        <ProtectedContactActions listing={listing} />
      </SectionCard>

      <SectionCard title="Location">
        <a
          href={auth.currentUser ? mapLink : undefined}
          target={auth.currentUser ? "_blank" : undefined}
          rel={auth.currentUser ? "noreferrer" : undefined}
          onClick={(event) => {
            if (requireStudentLogin("map")) {
              event.preventDefault();
              return;
            }

            handleAnalyticsClick("map_click", "mapClicks");
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-[#F6F1E8]"
        >
          <MapPin size={16} />
          Open Google Map
        </a>
      </SectionCard>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm leading-6 text-amber-800">
          CampusStay helps students find PGs and rooms. Please visit the
          place and verify all details before making any payment.
        </p>
      </div>
    </div>
  );
}
