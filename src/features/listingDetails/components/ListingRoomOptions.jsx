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

export default function ListingRoomOptions({ listing }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Room options">
        <div className="grid gap-3">
          {(listing.roomOptions || []).length > 0 ? (
            listing.roomOptions.map((room) => (
              <div
                key={room.id || room.title}
                className="rounded-3xl border border-[#E8DFD2] bg-[#FFF8EF] p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-black text-[#1F2933]">
                      {room.title}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      Seats left: {room.availableUnits || 0}
                    </p>

                    {room.note && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {room.note}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                    <p className="text-lg font-black text-[#1F2933]">
                      ₹{room.rent}
                    </p>
                    <p className="text-xs text-slate-500">per month</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-slate-700">
                  Advance: ₹{room.deposit || 0}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No room options added.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Charges">
        <div className="grid gap-2 text-sm">
          <DetailRow
            label="Electricity"
            value={
              listing.electricityIncluded
                ? "Included"
                : `₹${listing.electricityCharge || 0}`
            }
          />
          <DetailRow
            label="Other charges"
            value={listing.otherCharges || "Not added"}
          />
        </div>
      </SectionCard>
    </div>
  );
}
