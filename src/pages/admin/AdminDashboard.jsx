import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Link} from "react-router";
import { logoutAdmin } from "../../firebase/auth";
import {
  CheckCircle2,
  Clock,
  Eye,
  Home as HomeIcon,
  Loader2,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import {
  deleteListing,
  getAllListings,
  updateListing,
} from "../../firebase/listings";

import AdminListingDetailsModal from "../../components/admin/AdminListingDetailsModal";

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminListings, setAdminListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  async function loadListings() {
    try {
      setLoading(true);
      const data = await getAllListings();
      setAdminListings(data);
    } catch (error) {
      console.error("Error loading listings:", error);
      alert("Could not load listings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

async function handleUpdate(listingId, updates) {
  try {
    setActionLoadingId(listingId);

    await updateListing(listingId, updates);

    setSelectedListing((previousListing) => {
      if (!previousListing || previousListing.id !== listingId) {
        return previousListing;
      }

      return {
        ...previousListing,
        ...updates,
      };
    });

    await loadListings();
  } catch (error) {
    console.error("Error updating listing:", error);
    alert("Could not update listing.");
  } finally {
    setActionLoadingId(null);
  }
}

  async function handleDelete(listingId) {
    const confirmDelete = confirm("Delete this listing permanently?");

    if (!confirmDelete) return;

    try {
      setActionLoadingId(listingId);
      await deleteListing(listingId);
      await loadListings();

      if (selectedListing?.id === listingId) {
        setSelectedListing(null);
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Could not delete listing.");
    } finally {
      setActionLoadingId(null);
    }
  }


  <Link
  to="/admin/reports"
  className="hidden rounded-2xl border border-[#E8DFD2] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#F6F1E8] sm:inline-block"
>
  Reports
</Link>
  async function handleLogout() {
  try {
        await logoutAdmin();
        navigate("/admin/login");
    } catch (error) {
        console.error("Logout error:", error);
        alert("Could not logout.");
    }
    }

  const totalListings = adminListings.length;
  const pendingListings = adminListings.filter((item) => !item.approved).length;
  const approvedListings = adminListings.filter((item) => item.approved).length;
  const verifiedListings = adminListings.filter((item) => item.verified).length;
  const fullListings = adminListings.filter((item) => !item.available).length;

  const filteredListings = useMemo(() => {
    return adminListings.filter((listing) => {
      const searchText = `${listing.name || ""} ${listing.ownerName || ""} ${
        listing.area || ""
      } ${listing.phone || ""}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Pending" && !listing.approved) ||
        (activeFilter === "Approved" && listing.approved) ||
        (activeFilter === "Verified" && listing.verified) ||
        (activeFilter === "Full" && !listing.available);

      return matchesSearch && matchesFilter;
    });
  }, [adminListings, search, activeFilter]);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-[#E8DFD2] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white shadow-sm">
              <HomeIcon size={22} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">CampusStay</h1>
              <p className="text-xs text-slate-500">Admin dashboard</p>
            </div>
          </Link>

          <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#FFF8EF]"
                >
                <LogOut size={16} />
                Logout
            </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-[2rem] bg-[#1E5B4F] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                <Sparkles size={16} />
                CampusStay Control Panel
              </div>

              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                Admin Dashboard
              </h2>

              <p className="mt-3 max-w-2xl text-slate-300">
                Review submitted stays, check owner details, approve listings,
                verify them, and control what appears publicly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
              <HeroMiniStat label="Total" value={totalListings} />
              <HeroMiniStat label="Pending" value={pendingListings} />
              <HeroMiniStat label="Approved" value={approvedListings} />
              <HeroMiniStat label="Verified" value={verifiedListings} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total listings"
            value={totalListings}
            icon={<HomeIcon size={21} />}
          />

          <StatCard
            title="Pending"
            value={pendingListings}
            icon={<Clock size={21} />}
          />

          <StatCard
            title="Approved"
            value={approvedListings}
            icon={<CheckCircle2 size={21} />}
          />

          <StatCard
            title="Verified"
            value={verifiedListings}
            icon={<ShieldCheck size={21} />}
          />

          <StatCard
            title="Full"
            value={fullListings}
            icon={<Users size={21} />}
          />
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-2xl font-black">Manage listings</h3>
              <p className="mt-1 text-sm text-slate-500">
                Open a listing to see all details before approving it.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] lg:flex lg:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search listing, owner, area..."
                  className="h-12 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] pl-11 pr-4 text-sm outline-none focus:border-slate-400 lg:w-72"
                />
              </div>

              <Link
                to="/submit-listing"
                className="rounded-2xl bg-[#1E5B4F] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#123C35]"
              >
                Add new listing
              </Link>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {["All", "Pending", "Approved", "Verified", "Full"].map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    activeFilter === filter
                      ? "border-slate-950 bg-[#1E5B4F] text-white"
                      : "border-[#E8DFD2] bg-white text-slate-600 hover:bg-[#FFF8EF]"
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 p-10 text-slate-500">
              <Loader2 size={22} className="animate-spin" />
              Loading listings...
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
              <h3 className="text-xl font-bold">No listings found</h3>
              <p className="mt-2 text-slate-500">
                Try changing the search or filter.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 lg:hidden">
                {filteredListings.map((listing) => {
                  const isActionLoading = actionLoadingId === listing.id;
                  const coverImage =
                    listing.images?.[0] ||
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&auto=format&fit=crop";

                  return (
                    <div
                      key={listing.id}
                      className="rounded-3xl border border-[#E8DFD2] bg-white p-4 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <img
                          src={coverImage}
                          alt={listing.name}
                          className="h-24 w-28 shrink-0 rounded-2xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="line-clamp-2 text-base font-black text-slate-950">
                            {listing.name || "Unnamed listing"}
                          </h4>

                          <p className="mt-1 text-sm text-slate-500">
                            {listing.area || "Area not added"} ·{" "}
                            {listing.distance || "Distance not added"}
                          </p>

                          <p className="mt-2 text-lg font-black text-slate-950">
                            {listing.roomOptions?.length || 1} room option
{(listing.roomOptions?.length || 1) > 1 ? "s" : ""}
                            <span className="ml-1 text-xs font-semibold text-slate-500">
                              /month
                            </span>
                          </p>

                          
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <InfoMini
                            label="Room options"
                            value={`${listing.roomOptions?.length || 1} option${
                                (listing.roomOptions?.length || 1) > 1 ? "s" : ""
                            }`}
                            />
                        <InfoMini
                          label="Owner"
                          value={listing.ownerName || "Not added"}
                        />
                        <InfoMini
                          label="Phone"
                          value={listing.phone || "Not added"}
                        />
                        <InfoMini
                          label="Stay"
                          value={`${listing.type || "Type"} · ${
                            listing.gender || "For"
                          }`}
                        />
                        <InfoMini
                          label="Deposit"
                          value={`₹${listing.deposit || 0}`}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <StatusPill
                          label={listing.approved ? "Approved" : "Pending"}
                          tone={listing.approved ? "green" : "yellow"}
                        />

                        <StatusPill
                          label={
                            listing.verified ? "Verified" : "Not verified"
                          }
                          tone={listing.verified ? "blue" : "gray"}
                        />

                        <StatusPill
                          label={listing.available ? "Available" : "Full"}
                          tone={listing.available ? "green" : "red"}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedListing(listing)}
                          className="rounded-2xl bg-slate-100 px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                          View details
                        </button>

                        <button
                          disabled={isActionLoading}
                          onClick={() =>
                            handleUpdate(listing.id, {
                            approved: !listing.approved,
                            status: listing.approved ? "pending" : "approved",
                            })
                          }
                          className="rounded-2xl bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {listing.approved ? "Unapprove" : "Approve"}
                        </button>

                        <button
                          disabled={isActionLoading}
                          onClick={() =>
                            handleUpdate(listing.id, {
                              verified: !listing.verified,
                              verificationLevel: listing.verified
                                ? "Not Verified"
                                : "CampusStay Verified",
                            })
                          }
                          className="rounded-2xl bg-indigo-50 px-3 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                        >
                          {listing.verified ? "Unverify" : "Verify"}
                        </button>

                        <button
                          disabled={isActionLoading}
                          onClick={() =>
                            handleUpdate(listing.id, {
                              available: !listing.available,
                            })
                          }
                          className="rounded-2xl bg-amber-50 px-3 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                        >
                          {listing.available ? "Mark full" : "Available"}
                        </button>

                        <button
                          disabled={isActionLoading}
                          onClick={() => handleDelete(listing.id)}
                          className="col-span-2 rounded-2xl bg-red-50 px-3 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          Delete listing
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E8DFD2] text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-3 pr-4">Listing</th>
                      <th className="py-3 pr-4">Owner</th>
                      <th className="py-3 pr-4">Stay</th>
                      <th className="py-3 pr-4">Location</th>
                      <th className="py-3 pr-4">Rent</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredListings.map((listing) => {
                      const isActionLoading = actionLoadingId === listing.id;
                      const coverImage =
                        listing.images?.[0] ||
                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&auto=format&fit=crop";

                      return (
                        <tr
                          key={listing.id}
                          className="border-b border-slate-100 align-middle last:border-0"
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={coverImage}
                                alt={listing.name}
                                className="h-14 w-20 rounded-2xl object-cover"
                              />

                              <div>
                                <p className="font-black text-slate-950">
                                  {listing.name || "Unnamed listing"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {listing.food ? "Food included" : "No food"} ·{" "}
                                  {listing.roomType || "Room type not added"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 pr-4">
                            <p className="font-bold text-slate-900">
                              {listing.ownerName || "Not added"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {listing.phone || "No phone"}
                            </p>
                          </td>

                          <td className="py-4 pr-4">
                            <p className="font-semibold">
                              {listing.type} · {listing.gender}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Deposit ₹{listing.deposit || 0}
                            </p>
                          </td>

                          <td className="py-4 pr-4">
                            <p className="font-semibold">
                              {listing.area || "Not added"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {listing.distance || "Distance not added"}
                            </p>
                          </td>

                          <td className="py-4 pr-4">
                            <p className="text-base font-black">
                              ₹{listing.rent || 0}
                            </p>
                            <p className="text-xs text-slate-500">per month</p>
                          </td>

                          <td className="py-4 pr-4">
                            <div className="flex flex-col gap-2">
                              <StatusPill
                                label={
                                  listing.approved ? "Approved" : "Pending"
                                }
                                tone={listing.approved ? "green" : "yellow"}
                              />

                              <StatusPill
                                label={
                                  listing.verified
                                    ? "Verified"
                                    : "Not verified"
                                }
                                tone={listing.verified ? "blue" : "gray"}
                              />

                              <StatusPill
                                label={
                                  listing.available ? "Available" : "Full"
                                }
                                tone={listing.available ? "green" : "red"}
                              />
                            </div>
                          </td>

                          <td className="py-4 pr-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setSelectedListing(listing)}
                                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Eye size={14} />
                                  View
                                </span>
                              </button>

                              <button
                                disabled={isActionLoading}
                                onClick={() =>
                                  handleUpdate(listing.id, {
                                    approved: !listing.approved,
                                    status: listing.approved ? "pending" : "approved",
                                  })
                                }
                                className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                              >
                                {listing.approved ? "Unapprove" : "Approve"}
                              </button>

                              <button
                                disabled={isActionLoading}
                                onClick={() =>
                                  handleUpdate(listing.id, {
                                    verified: !listing.verified,
                                    verificationLevel: listing.verified
                                      ? "Not Verified"
                                      : "CampusStay Verified",
                                  })
                                }
                                className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                              >
                                {listing.verified ? "Unverify" : "Verify"}
                              </button>

                              <button
                                disabled={isActionLoading}
                                onClick={() =>
                                  handleUpdate(listing.id, {
                                    available: !listing.available,
                                  })
                                }
                                className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                              >
                                {listing.available ? "Mark full" : "Available"}
                              </button>

                              <button
                                disabled={isActionLoading}
                                onClick={() => handleDelete(listing.id)}
                                className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      {selectedListing && (
        <AdminListingDetailsModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
            onUpdate={handleUpdate}
            saving={actionLoadingId === selectedListing.id}
         />
      )}
    </main>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-[1.7rem] border border-[#E8DFD2] bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white">
        {icon}
      </div>

      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function HeroMiniStat({ label, value }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function StatusPill({ label, tone }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    blue: "bg-indigo-50 text-indigo-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

function InfoMini({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#FFF8EF] px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default AdminDashboard;