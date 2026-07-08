function SectionCard({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-black text-[#070B1F]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-bold text-slate-800">
        {value || "Not added"}
      </span>
    </div>
  );
}

export default function ListingRulesSection({ listing }) {
  if (!listing.structuredRules) return null;

  return (
    <SectionCard title="Rules and safety">
      <div className="grid gap-2 text-sm">
        <DetailRow
          label="Entry time"
          value={listing.structuredRules.entryTime}
        />
        <DetailRow
          label="Visitors"
          value={listing.structuredRules.visitorsAllowed}
        />
        <DetailRow
          label="Parents"
          value={listing.structuredRules.parentsAllowed}
        />
        <DetailRow
          label="Smoking"
          value={listing.structuredRules.smokingAllowed}
        />
        <DetailRow
          label="Gents"
          value={listing.structuredRules.gentsAllowed}
        />
        <DetailRow
          label="Girls"
          value={listing.structuredRules.girlsAllowed}
        />
        <DetailRow
          label="ID proof"
          value={listing.structuredRules.idProofRequired}
        />
      </div>
    </SectionCard>
  );
}
