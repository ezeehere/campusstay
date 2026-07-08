function SectionCard({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-black text-[#070B1F]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function ListingEssentialsSection({ listing }) {
  if (!Array.isArray(listing.nearbyEssentials) || listing.nearbyEssentials.length === 0) {
    return null;
  }

  return (
    <SectionCard title="Nearby essentials">
      <div className="flex flex-wrap gap-2">
        {listing.nearbyEssentials.map((item) => (
          <span
            key={item}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700"
          >
            {item}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}
