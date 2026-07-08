function SectionCard({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-black text-[#070B1F]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function ListingFacilitiesSection({ listing, foodIncluded }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Food details">
        <p className="text-sm leading-6 text-slate-600">
          {listing.foodDetails ||
            (foodIncluded ? "Food included" : "Food not included")}
        </p>
      </SectionCard>

      <SectionCard title="Facilities">
        {(listing.facilities || []).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {listing.facilities.map((facility) => (
              <span
                key={facility}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700"
              >
                {facility}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No facilities added.</p>
        )}
      </SectionCard>
    </div>
  );
}
