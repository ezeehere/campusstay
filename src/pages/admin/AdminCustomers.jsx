import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
    ArrowLeft,
    Eye,
    Heart,
    Loader2,
    MapPin,
    MessageCircle,
    Phone,
    Search,
    UserRound,
} from "lucide-react";

import { getAdminCustomerAnalytics } from "../../firebase/customerAnalytics";

function formatDateFromSeconds(seconds) {
    if (!seconds) return "No activity yet";

    return new Date(seconds * 1000).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getEventLabel(eventType) {
    const labels = {
        view_details: "Viewed listing",
        save: "Saved listing",
        call_click: "Clicked call",
        whatsapp_click: "Clicked WhatsApp",
        map_click: "Opened map",
    };

    return labels[eventType] || eventType || "Activity";
}

function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    async function loadCustomers() {
        try {
            setLoading(true);
            const data = await getAdminCustomerAnalytics();
            setCustomers(data);
        } catch (error) {
            console.error(error);
            alert("Could not load customer analytics.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        const cleanSearch = search.toLowerCase().trim();

        if (!cleanSearch) return customers;

        return customers.filter((customer) =>
            customer.searchText.includes(cleanSearch)
        );
    }, [customers, search]);

    const totals = useMemo(() => {
        return {
            students: customers.length,
            saved: customers.reduce((sum, item) => sum + item.stats.saved, 0),
            views: customers.reduce((sum, item) => sum + item.stats.views, 0),
            calls: customers.reduce((sum, item) => sum + item.stats.calls, 0),
            whatsapp: customers.reduce((sum, item) => sum + item.stats.whatsapp, 0),
            leads: customers.reduce(
                (sum, item) => sum + item.stats.callbackRequests,
                0
            ),
        };
    }, [customers]);

    if (loading) {
        return (
            <main className="cs-page flex min-h-screen items-center justify-center px-4 text-slate-600">
                <div className="flex items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm">
                    <Loader2 className="animate-spin" size={20} />
                    Loading customers...
                </div>
            </main>
        );
    }

    return (
        <main className="cs-page min-h-screen px-3 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl overflow-x-hidden">
                <header className="rounded-[1.5rem] bg-[#1E5B4F] p-5 text-white shadow-sm sm:rounded-[2rem] sm:p-7">
                    <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-bold text-white/85"
                    >
                        <ArrowLeft size={16} />
                        Back to admin dashboard
                    </Link>

                    <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="w-fit rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
                                Customer analytics
                            </p>

                            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                                Registered Students
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                                See student preferences, saved PGs, listing activity, contact
                                clicks, and callback requests.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                            <TopStat label="Students" value={totals.students} />
                            <TopStat label="Saved" value={totals.saved} />
                            <TopStat label="Views" value={totals.views} />
                            <TopStat label="Calls" value={totals.calls} />
                            <TopStat label="WhatsApp" value={totals.whatsapp} />
                            <TopStat label="Leads" value={totals.leads} />
                        </div>
                    </div>
                </header>

                <section className="mt-5 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-[#1F2933]">
                                Customer list
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Open a student profile to view saved listings and activity.
                            </p>
                        </div>

                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search name, email, phone, area..."
                                className="h-12 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] pl-11 pr-4 text-sm outline-none focus:border-[#1E5B4F] lg:w-80"
                            />
                        </div>
                    </div>

                    {filteredCustomers.length === 0 ? (
                        <div className="mt-5 rounded-3xl border border-dashed border-slate-300 p-8 text-center">
                            <h3 className="text-lg font-bold text-[#1F2933]">
                                No customers found
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Try another search keyword.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredCustomers.map((customer) => (
                                <CustomerCard
                                    key={customer.id}
                                    customer={customer}
                                    onOpen={() => setSelectedCustomer(customer)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {selectedCustomer && (
                    <CustomerDetailsModal
                        customer={selectedCustomer}
                        onClose={() => setSelectedCustomer(null)}
                    />
                )}
            </div>
        </main>
    );
}

function TopStat({ label, value }) {
    return (
        <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-white/60">
                {label}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

function CustomerCard({ customer, onOpen }) {
    return (
        <article className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F6F1E8] text-[#1E5B4F]">
                    <UserRound size={21} />
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 text-lg font-bold text-[#1F2933]">
                        {customer.fullName || "Student"}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {customer.email || "No email"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Last active: {formatDateFromSeconds(customer.lastActiveSeconds)}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniStat label="Saved" value={customer.stats.saved} />
                <MiniStat label="Views" value={customer.stats.views} />
                <MiniStat label="Calls" value={customer.stats.calls} />
                <MiniStat label="WhatsApp" value={customer.stats.whatsapp} />
                <MiniStat label="Map" value={customer.stats.maps} />
                <MiniStat label="Leads" value={customer.stats.callbackRequests} />
            </div>

            <div className="mt-4 rounded-2xl bg-[#FFF8EF] p-3 text-sm leading-6 text-slate-600">
                <p>
                    <span className="font-bold text-[#1F2933]">Preference:</span>{" "}
                    {customer.preferredStayType || "Any stay"} · ₹
                    {customer.budgetMin || "Any"} - ₹{customer.budgetMax || "Any"}
                </p>
                <p>
                    <span className="font-bold text-[#1F2933]">Area:</span>{" "}
                    {customer.preferredArea || "Any area"}
                </p>
            </div>

            <button
                type="button"
                onClick={onOpen}
                className="mt-4 w-full rounded-2xl bg-[#1E5B4F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
            >
                View customer details
            </button>
        </article>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-2xl bg-[#F6F1E8] p-2 text-center">
            <p className="text-base font-bold text-[#1F2933]">{value}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {label}
            </p>
        </div>
    );
}

function CustomerDetailsModal({ customer, onClose }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-end justify-center bg-[#070B1F]/50 px-3 pb-3 sm:items-center sm:p-4">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[1.7rem] bg-white shadow-2xl">
                <div className="sticky top-0 z-10 border-b border-[#E8DFD2] bg-[#FFF8EF] px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-[#1E5B4F]">
                                Customer profile
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-[#1F2933]">
                                {customer.fullName || "Student"}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {customer.email || "No email"} · {customer.phone || "No phone"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-[#E8DFD2] bg-white px-4 py-2 text-sm font-bold text-slate-700"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
                    <section className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4">
                        <h3 className="text-lg font-bold text-[#1F2933]">
                            Preferences
                        </h3>

                        <div className="mt-4 grid gap-3 text-sm">
                            <InfoRow label="Institution" value={customer.college || "Not set"} />
                            <InfoRow label="Gender" value={customer.gender || "Not set"} />
                            <InfoRow
                                label="Budget"
                                value={`₹${customer.budgetMin || "Any"} - ₹${customer.budgetMax || "Any"}`}
                            />
                            <InfoRow
                                label="Preferred area"
                                value={customer.preferredArea || "Any"}
                            />
                            <InfoRow
                                label="Stay type"
                                value={customer.preferredStayType || "PG or Room"}
                            />
                            <InfoRow
                                label="Food"
                                value={customer.foodRequired || "Optional"}
                            />
                            <InfoRow
                                label="Move-in"
                                value={customer.moveInTime || "Not set"}
                            />
                        </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4">
                        <h3 className="text-lg font-bold text-[#1F2933]">
                            Activity summary
                        </h3>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                            <MiniStat label="Saved" value={customer.stats.saved} />
                            <MiniStat label="Views" value={customer.stats.views} />
                            <MiniStat label="Calls" value={customer.stats.calls} />
                            <MiniStat label="WhatsApp" value={customer.stats.whatsapp} />
                            <MiniStat label="Map" value={customer.stats.maps} />
                            <MiniStat label="Leads" value={customer.stats.callbackRequests} />
                        </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-[#1F2933]">
                            <Heart size={19} />
                            Saved listings
                        </h3>

                        <div className="mt-4 grid gap-3">
                            {customer.savedListings.length === 0 ? (
                                <p className="text-sm text-slate-500">No saved listings.</p>
                            ) : (
                                customer.savedListings.map((item) => (
                                    <SmallListingRow key={item.id} item={item} />
                                ))
                            )}
                        </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-[#1F2933]">
                            <Eye size={19} />
                            Recent activity
                        </h3>

                        <div className="mt-4 grid gap-3">
                            {customer.analyticsEvents.length === 0 ? (
                                <p className="text-sm text-slate-500">No activity yet.</p>
                            ) : (
                                customer.analyticsEvents.slice(0, 20).map((event) => (
                                    <ActivityRow key={event.id} event={event} />
                                ))
                            )}
                        </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 lg:col-span-2">
                        <h3 className="text-lg font-bold text-[#1F2933]">
                            Consented callback leads
                        </h3>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {customer.callbackLeads.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    No callback requests yet.
                                </p>
                            ) : (
                                customer.callbackLeads.map((lead) => (
                                    <LeadCard key={lead.id} lead={lead} />
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-2xl bg-[#FFF8EF] px-4 py-3">
            <p className="text-slate-500">{label}</p>
            <p className="text-right font-bold text-[#1F2933]">{value}</p>
        </div>
    );
}

function SmallListingRow({ item }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-[#FFF8EF] p-3">
            {item.image ? (
                <img
                    src={item.image}
                    alt={item.listingName}
                    className="h-12 w-14 rounded-xl object-cover"
                />
            ) : (
                <div className="h-12 w-14 rounded-xl bg-[#F6F1E8]" />
            )}

            <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-bold text-[#1F2933]">
                    {item.listingName}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                    {item.area} · ₹{item.rent}
                </p>
            </div>
        </div>
    );
}

function ActivityRow({ event }) {
    const iconMap = {
        view_details: <Eye size={16} />,
        call_click: <Phone size={16} />,
        whatsapp_click: <MessageCircle size={16} />,
        map_click: <MapPin size={16} />,
        save: <Heart size={16} />,
    };

    return (
        <div className="flex items-start gap-3 rounded-2xl bg-[#FFF8EF] p-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1E5B4F]">
                {iconMap[event.eventType] || <Eye size={16} />}
            </div>

            <div className="min-w-0">
                <p className="text-sm font-bold text-[#1F2933]">
                    {getEventLabel(event.eventType)}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                    {event.listingName || "Unknown listing"} · {event.area || "Area not added"}
                </p>
            </div>
        </div>
    );
}

function LeadCard({ lead }) {
    return (
        <div className="rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] p-4">
            <p className="text-sm font-bold text-[#1F2933]">
                {lead.listingName}
            </p>

            <p className="mt-1 text-xs text-slate-500">
                {lead.listingArea} · ₹{lead.listingRent}
            </p>

            <div className="mt-3 grid gap-2 text-sm">
                <p>
                    <span className="font-bold text-[#1F2933]">Phone:</span>{" "}
                    {lead.studentPhone}
                </p>
                <p>
                    <span className="font-bold text-[#1F2933]">Status:</span>{" "}
                    {lead.status}
                </p>
            </div>
        </div>
    );
}

export default AdminCustomers;