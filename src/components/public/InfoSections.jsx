export function TrustProcessSection() {
  const items = [
    { title: "Owner submits stay", text: "PG owners add photos, rent, seats left, food and rules." },
    { title: "Admin checks details", text: "Listings are reviewed before becoming public." },
    { title: "Students contact directly", text: "Call, WhatsApp or request callback without broker fee." },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1E5B4F]">Trust first</p>
            <h2 className="mt-2 text-2xl font-black text-[#03071F]">Built to reduce PG confusion</h2>
          </div>
          <span className="w-fit rounded-full bg-[#FFF3D6] px-4 py-2 text-xs font-black text-[#B45309]">
            No random unverified posts
          </span>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.title} className="rounded-[1.5rem] border border-[#E8DFD2] bg-[#FFF8EF] p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#03071F] text-sm font-black text-white">
                {index + 1}
              </div>
              <h3 className="mt-4 font-black text-[#03071F]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OwnerCTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#070B1F] p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#42B66B]/30 blur-3xl" />
        <div className="absolute -bottom-24 left-20 h-60 w-60 rounded-full bg-orange-400/25 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#A7F3D0]">For PG owners</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-tight">
              Have empty seats? List your PG and share one clean public link.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              Add photos, rent, rules, seats left and move-in info. Students can call or WhatsApp you directly.
            </p>
          </div>
          <a href="/submit-listing" className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-sm font-black text-[#070B1F] transition hover:bg-[#FFF3D6]">
            List your PG
          </a>
        </div>
      </div>
    </section>
  );
}