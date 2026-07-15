import { Edit3, LogOut, ShieldCheck, UserRound } from "lucide-react";

const RUPEE = "\u20B9";

function formatBudgetRange(profile) {
  const minBudget = profile?.budgetMin || "Any";
  const maxBudget = profile?.budgetMax || "Any";
  const minText = minBudget === "Any" ? "Any" : `${RUPEE}${minBudget}`;
  const maxText = maxBudget === "Any" ? "Any" : `${RUPEE}${maxBudget}`;

  return `${minText} - ${maxText}`;
}

function formatPreferredAreas(profile) {
  if (Array.isArray(profile?.preferredAreas) && profile.preferredAreas.length > 0) {
    return profile.preferredAreas.join(", ");
  }

  return profile?.preferredArea || "Any area";
}

function formatConsentDate(value) {
  if (!value) return "";

  const date = typeof value?.toDate === "function"
    ? value.toDate()
    : value?.seconds
      ? new Date(value.seconds * 1000)
      : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-[#FFF8EF] px-4 py-3 text-sm">
      <p className="text-slate-500">{label}</p>
      <p className="max-w-[60%] text-right font-bold text-[#1F2933]">
        {value || "Not set"}
      </p>
    </div>
  );
}

function ProfileSection({ icon, title, children }) {
  return (
    <section className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-[#1F2933]">
        {icon}
        {title}
      </h3>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function ConsentValue({ accepted, date }) {
  return accepted ? `Accepted${date ? ` on ${date}` : ""}` : "Not accepted";
}

function StudentProfileTab({ profile, studentUser, onEditPreferences, onLogout }) {
  const termsDate = formatConsentDate(profile?.termsAcceptedAt);
  const privacyDate = formatConsentDate(profile?.privacyAcceptedAt);

  return (
    <div className="grid gap-4">
      {!profile?.fullName || !profile?.phone ? (
        <div className="rounded-[1.5rem] border border-[#E8DFD2] bg-[#FFF8EF] p-4 text-sm font-semibold text-slate-600">
          Profile details are incomplete. Please update your preferences.
        </div>
      ) : null}

      <ProfileSection icon={<UserRound size={19} />} title="Account">
        <InfoRow label="Name" value={profile?.fullName || studentUser?.displayName} />
        <InfoRow label="Email" value={studentUser?.email || profile?.email} />
        <InfoRow label="Phone" value={profile?.phone} />
        <InfoRow label="Institution" value={profile?.institutionName || profile?.college} />
        <InfoRow label="Gender / Stay Suitable For" value={profile?.gender} />
      </ProfileSection>

      <ProfileSection icon={<ShieldCheck size={19} />} title="Stay Preferences">
        <InfoRow label="Budget" value={formatBudgetRange(profile)} />
        <InfoRow label="Preferred areas" value={formatPreferredAreas(profile)} />
        <InfoRow label="Stay type" value={profile?.preferredStayType || "PG or Room"} />
        <InfoRow label="Food required" value={profile?.foodRequired} />
        <InfoRow label="Room sharing preference" value={profile?.preferredRoomType} />
        <InfoRow label="Move-in time" value={profile?.moveInTime} />
      </ProfileSection>

      <ProfileSection icon={<ShieldCheck size={19} />} title="Privacy & Consent">
        <InfoRow
          label="Terms accepted"
          value={<ConsentValue accepted={profile?.termsAccepted === true} date={termsDate} />}
        />
        <InfoRow
          label="Privacy accepted"
          value={<ConsentValue accepted={profile?.privacyAccepted === true} date={privacyDate} />}
        />
      </ProfileSection>

      <section className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
        <h3 className="text-lg font-bold text-[#1F2933]">Account Actions</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onEditPreferences}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
          >
            <Edit3 size={17} />
            Edit preferences
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </section>
    </div>
  );
}

export default StudentProfileTab;