import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  Home as HomeIcon,
  IndianRupee,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  Phone,
  PlusCircle,
  Save,
  SearchCheck,
  Users,
} from "lucide-react";

import { getOwnerListings } from "../../firebase/listings";
import { logoutOwner, watchOwnerAuth } from "../../firebase/ownerAuth";
import { getOwnerProfile, updateOwnerProfile } from "../../firebase/owners";
import { getOwnerPlan, requestLeadAccess } from "../../firebase/ownerPlans";
import { getOwnerCallbackLeads } from "../../firebase/studentLeads";

function getMetric(listing, key) {
  return Number(listing.analytics?.[key] || listing[key] || 0);
}

function OwnerDashboard() {
  const navigate = useNavigate();

  const [ownerUser, setOwnerUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ownerPlan, setOwnerPlan] = useState(null);
  const [listings, setListings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [refreshingListings, setRefreshingListings] = useState(false);
  const [leadRequestLoading, setLeadRequestLoading] = useState(false);
  const [leadAccessRequested, setLeadAccessRequested] = useState(false);
  const [callbackLeads, setCallbackLeads] = useState([]);
  const [loadingCallbackLeads, setLoadingCallbackLeads] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    businessName: "",
    area: "",
  });

  async function loadOwnerListings(user, ownerProfile) {
    if (!user) return;

    setRefreshingListings(true);

    const ownerListings = await getOwnerListings({
      ownerId: user.uid,
      phone: ownerProfile?.phone || "",
    });

    setListings(ownerListings);
    setRefreshingListings(false);
  }

  useEffect(() => {
    const unsubscribe = watchOwnerAuth(async (user) => {
      if (!user) {
        setOwnerUser(null);
        setLoading(false);
        return;
      }

      setOwnerUser(user);

      const ownerProfile = await getOwnerProfile(user.uid);
      setProfile(ownerProfile);

      setProfileForm({
        fullName: ownerProfile?.fullName || user.displayName || "",
        phone: ownerProfile?.phone || "",
        businessName: ownerProfile?.businessName || "",
        area: ownerProfile?.area || "",
      });

      try {
        const plan = await getOwnerPlan(user.uid);
        setOwnerPlan(plan);
      } catch (error) {
        console.warn("Could not load owner plan:", error);
        setOwnerPlan({
          ownerId: user.uid,
          plan: "free",
          active: false,
          leadAccess: false,
        });
      }

      await loadOwnerListings(user, ownerProfile);
      await loadCallbackLeads(user, ownerProfile, plan);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const summary = useMemo(() => {
    return {
      totalListings: listings.length,
      approved: listings.filter((item) => item.approved).length,
      pending: listings.filter((item) => item.status === "pending").length,
      verified: listings.filter((item) => item.verified).length,
      views: listings.reduce((sum, item) => sum + getMetric(item, "views"), 0),
      saves: listings.reduce((sum, item) => sum + getMetric(item, "saves"), 0),
      calls: listings.reduce(
        (sum, item) => sum + getMetric(item, "callClicks"),
        0
      ),
      whatsapp: listings.reduce(
        (sum, item) => sum + getMetric(item, "whatsappClicks"),
        0
      ),
      callbacks: listings.reduce(
        (sum, item) => sum + getMetric(item, "callbackRequests"),
        0
      ),
    };
  }, [listings]);

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfileForm((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    if (!ownerUser) return;

    if (!profileForm.phone.trim()) {
      alert("Please add your phone number. It helps match your PG listings.");
      return;
    }

    try {
      setSavingProfile(true);

      await updateOwnerProfile(ownerUser.uid, {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        businessName: profileForm.businessName.trim(),
        area: profileForm.area.trim(),
      });

      const updatedProfile = await getOwnerProfile(ownerUser.uid);
      setProfile(updatedProfile);

      await loadOwnerListings(ownerUser, updatedProfile);
      await loadCallbackLeads(ownerUser, updatedProfile, ownerPlan);

      alert("Owner profile saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save owner profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function loadCallbackLeads(user, ownerProfile, plan) {
    if (!user) return;

    const hasLeadAccess = plan?.active === true && plan?.leadAccess === true;

    if (!hasLeadAccess) {
      setCallbackLeads([]);
      return;
    }

    try {
      setLoadingCallbackLeads(true);

      const leads = await getOwnerCallbackLeads(
        user.uid,
        ownerProfile?.phone || ""
      );

      setCallbackLeads(leads);
    } catch (error) {
      console.error("Could not load callback leads:", error);
    } finally {
      setLoadingCallbackLeads(false);
    }
  }

  async function handleRequestLeadAccess() {
    if (!ownerUser) return;

    const ownerPhone = profile?.phone || profileForm.phone;

    if (!ownerPhone?.trim()) {
      alert("Please save your owner phone number first.");
      return;
    }

    try {
      setLeadRequestLoading(true);

      const result = await requestLeadAccess({
        ownerId: ownerUser.uid,
        ownerName: profile?.fullName || profileForm.fullName || ownerUser.displayName || "",
        ownerEmail: ownerUser.email || "",
        ownerPhone: ownerPhone.trim(),
      });

      setLeadAccessRequested(true);

      if (result.alreadyExists) {
        alert("Your lead access request is already pending.");
        return;
      }

      alert("Lead access request sent to admin.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Could not request lead access.");
    } finally {
      setLeadRequestLoading(false);
    }
  }

  async function handleLogout() {
    await logoutOwner();
    navigate("/");
  }

  if (loading) {
    return (
      <main className="cs-page flex min-h-screen items-center justify-center px-3 py-4 text-slate-600">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm">
          <Loader2 className="animate-spin" size={20} />
          Loading owner dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="cs-page min-h-screen px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl overflow-x-hidden">
        <header className="rounded-[1.5rem] bg-[#1E5B4F] p-4 text-white shadow-sm sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
                <Building2 size={15} />
                Owner Dashboard
              </p>

              <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                Manage your PG listings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                List PGs, check approval status, see student interest, and unlock
                interested student leads.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                <HomeIcon size={16} />
                Home
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[#1E5B4F] transition hover:bg-[#F6F1E8]"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <Link
            to="/submit-listing"
            className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white">
              <PlusCircle size={22} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#1F2933]">
              List PG / Room
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add property details, room options, photos, facilities, and contact.
            </p>
          </Link>

          <Link
            to="/check-status"
            className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4D8] text-[#8A5A00]">
              <SearchCheck size={22} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#1F2933]">
              Check Status
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Check whether your listing is pending, approved, rejected, or needs changes.
            </p>
          </Link>
        </section>

        <LeadAccessCard
          ownerPlan={ownerPlan}
          summary={summary}
          requested={leadAccessRequested}
          loading={leadRequestLoading}
          onRequest={handleRequestLeadAccess}
        />
        <OwnerCallbackLeadsSection
          ownerPlan={ownerPlan}
          leads={callbackLeads}
          loading={loadingCallbackLeads}
        />

        <section className="mt-4 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-[#1F2933]">
              Owner profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Add the same phone number used in your PG listing to match older listings.
            </p>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="mt-4 grid gap-4 md:grid-cols-2"
          >
            <OwnerInput
              label="Owner Name"
              name="fullName"
              value={profileForm.fullName}
              onChange={handleProfileChange}
              placeholder="Owner name"
            />

            <OwnerInput
              label="Phone Number"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              placeholder="Same phone used while listing PG"
            />

            <OwnerInput
              label="Business / PG Name"
              name="businessName"
              value={profileForm.businessName}
              onChange={handleProfileChange}
              placeholder="Optional"
            />

            <OwnerInput
              label="Main Area"
              name="area"
              value={profileForm.area}
              onChange={handleProfileChange}
              placeholder="JIST Gate, Sotai, Tarajan"
            />

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {savingProfile ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Save owner profile
              </button>
            </div>
          </form>
        </section>

        {!profile?.phone ? (
          <section className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
            Add your phone number in Owner Profile to match your existing PG listings.
          </section>
        ) : listings.length === 0 ? (
          <section className="mt-4 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-5 text-center shadow-sm">
            <h3 className="text-xl font-bold text-[#1F2933]">
              No PG listed yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              List your PG or room to start getting student views, saves, calls,
              WhatsApp clicks, and callback requests.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                to="/submit-listing"
                className="rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
              >
                List PG / Room
              </Link>

              <Link
                to="/check-status"
                className="rounded-2xl border border-[#E8DFD2] bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
              >
                Check status
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <MetricCard
                title="Listings"
                value={summary.totalListings}
                icon={<Building2 size={20} />}
              />
              <MetricCard
                title="Approved"
                value={summary.approved}
                icon={<CheckCircle2 size={20} />}
              />
              <MetricCard
                title="Pending"
                value={summary.pending}
                icon={<Clock size={20} />}
              />
              <MetricCard
                title="Verified"
                value={summary.verified}
                icon={<CheckCircle2 size={20} />}
              />
              <MetricCard
                title="Callbacks"
                value={summary.callbacks}
                icon={<Users size={20} />}
              />
            </section>

            <section className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard title="Views" value={summary.views} icon={<Eye size={20} />} />
              <MetricCard title="Saves" value={summary.saves} icon={<Heart size={20} />} />
              <MetricCard title="Calls" value={summary.calls} icon={<Phone size={20} />} />
              <MetricCard
                title="WhatsApp"
                value={summary.whatsapp}
                icon={<MessageCircle size={20} />}
              />
            </section>

            <section className="mt-4 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-[#1F2933]">
                    <BarChart3 size={21} />
                    Your PG analytics
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Student views, saves, calls, WhatsApp clicks, map opens, and callback interest.
                  </p>
                </div>

                {refreshingListings && (
                  <p className="flex items-center gap-2 text-sm font-bold text-[#1E5B4F]">
                    <Loader2 className="animate-spin" size={16} />
                    Refreshing
                  </p>
                )}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {listings.map((listing) => (
                  <OwnerListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function LeadAccessCard({ ownerPlan, summary, requested, loading, onRequest }) {
  const hasLeadAccess = ownerPlan?.active === true && ownerPlan?.leadAccess === true;

  return (
    <section className="mt-4 overflow-hidden rounded-[1.5rem] border border-[#DDECE7] bg-white shadow-sm sm:rounded-[2rem]">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-[#F1FAF7] p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white">
              {hasLeadAccess ? <CheckCircle2 size={22} /> : <Lock size={22} />}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#1E5B4F]">
                Monetization Feature
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#123C35]">
                Interested Student Leads
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Students can request a callback from your PG listing. Lead access
                unlocks student contact details only for callback requests.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Callback requests
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#1F2933]">
                    {summary.callbacks}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Current plan
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#1F2933]">
                    {hasLeadAccess ? "Lead Access" : "Free"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="rounded-[1.3rem] border border-[#E8DFD2] bg-[#FFF8EF] p-4">
            <div className="flex items-center gap-2 text-[#1F2933]">
              <IndianRupee size={19} />
              <h3 className="text-lg font-bold">Lead Access Plan</h3>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Free owners can see views, saves, calls, and WhatsApp clicks.
              Paid owners can access interested students who requested callback.
            </p>

            <div className="mt-4 grid gap-2 text-sm">
              <FeatureLine text="View student callback interest" active />
              <FeatureLine text="Contact details only after student request" active />
              <FeatureLine text="Admin approval before access" active />
            </div>

            {hasLeadAccess ? (
              <button
                disabled
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white opacity-90"
              >
                <CheckCircle2 size={17} />
                Lead access active
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequest}
                disabled={loading || requested}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : requested ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <Lock size={17} />
                )}

                {loading
                  ? "Sending request..."
                  : requested
                    ? "Request sent to admin"
                    : "Request Lead Access"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureLine({ text, active }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2">
      <CheckCircle2
        size={16}
        className={active ? "text-[#1E5B4F]" : "text-slate-300"}
      />
      <span className="font-semibold text-slate-700">{text}</span>
    </div>
  );
}

function OwnerInput({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
      />
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="rounded-[1.35rem] border border-[#E8DFD2] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <h3 className="mt-1 text-2xl font-bold text-[#1F2933]">
            {value}
          </h3>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F6F1E8] text-[#1E5B4F]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function OwnerListingCard({ listing }) {
  const image = listing.images?.[0] || "";
  const status = listing.status || (listing.approved ? "approved" : "pending");

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[#E8DFD2] bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[160px_1fr]">
        <div className="aspect-[16/10] bg-[#F6F1E8] md:aspect-auto">
          {image ? (
            <img
              src={image}
              alt={listing.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center text-sm font-bold text-slate-400">
              No image
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="line-clamp-1 text-base font-bold text-[#1F2933]">
                {listing.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {listing.area} · {listing.type}
              </p>
            </div>

            <span className="rounded-full bg-[#FFF4D8] px-3 py-1 text-xs font-bold text-[#8A5A00]">
              {status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            <SmallMetric label="Views" value={getMetric(listing, "views")} />
            <SmallMetric label="Saves" value={getMetric(listing, "saves")} />
            <SmallMetric label="Calls" value={getMetric(listing, "callClicks")} />
            <SmallMetric
              label="WhatsApp"
              value={getMetric(listing, "whatsappClicks")}
            />
            <SmallMetric label="Map" value={getMetric(listing, "mapClicks")} />
            <SmallMetric
              label="Callbacks"
              value={getMetric(listing, "callbackRequests")}
            />
          </div>

          {listing.adminNote && (
            <div className="mt-4 rounded-2xl bg-[#FFF8EF] p-3 text-sm leading-6 text-slate-600">
              <span className="font-bold text-[#1F2933]">Admin note:</span>{" "}
              {listing.adminNote}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F6F1E8] p-2 text-center">
      <p className="text-base font-bold text-[#1F2933]">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}

function OwnerCallbackLeadsSection({ ownerPlan, leads, loading }) {
  const hasLeadAccess =
    ownerPlan?.active === true && ownerPlan?.leadAccess === true;

  if (!hasLeadAccess) return null;

  return (
    <section className="mt-4 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#1F2933]">
            <Users size={21} />
            Interested student leads
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Students who requested callback for your PG or room listings.
          </p>
        </div>

        {loading && (
          <p className="flex items-center gap-2 text-sm font-bold text-[#1E5B4F]">
            <Loader2 className="animate-spin" size={16} />
            Loading leads
          </p>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-slate-300 p-6 text-center">
          <h3 className="text-lg font-bold text-[#1F2933]">
            No callback leads yet
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            When students request callbacks, their details will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {leads.map((lead) => (
            <OwnerLeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </section>
  );
}

function OwnerLeadCard({ lead }) {
  const cleanPhone = String(lead.studentPhone || "").replace(/\D/g, "");
  const whatsappPhone = cleanPhone.startsWith("91")
    ? cleanPhone
    : `91${cleanPhone}`;

  const whatsappText = encodeURIComponent(
    `Hi ${lead.studentName || "there"}, this is regarding your callback request for ${lead.listingName || "my PG/room"} on CampusStay.`
  );

  const whatsappLink = `https://wa.me/${whatsappPhone}?text=${whatsappText}`;

  return (
    <article className="rounded-[1.5rem] border border-[#E8DFD2] bg-[#FFF8EF] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#1E5B4F]">
            Callback Request
          </p>

          <h3 className="mt-2 text-lg font-bold text-[#1F2933]">
            {lead.studentName || "Student"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {lead.studentCollege || "College not added"} ·{" "}
            {lead.studentGender || "Gender not added"}
          </p>
        </div>

        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          {lead.status || "new"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <LeadInfo label="Interested in" value={lead.listingName || "Listing"} />
        <LeadInfo
          label="Area / Rent"
          value={`${lead.listingArea || "Area"} · ₹${lead.listingRent || 0}`}
        />
        <LeadInfo
          label="Budget"
          value={`₹${lead.studentBudgetMin || "Any"} - ₹${lead.studentBudgetMax || "Any"}`}
        />
        <LeadInfo
          label="Preference"
          value={`${lead.studentPreferredStayType || "Any stay"} · ${lead.studentFoodRequired || "Food optional"
            }`}
        />
        <LeadInfo label="Phone" value={lead.studentPhone || "No phone"} />
        <LeadInfo label="Email" value={lead.studentEmail || "No email"} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <a
          href={`tel:${lead.studentPhone}`}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
        >
          <Phone size={16} />
          Call student
        </a>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </div>
    </article>
  );
}

function LeadInfo({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-white px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-bold text-[#1F2933]">{value}</span>
    </div>
  );
}

export default OwnerDashboard;