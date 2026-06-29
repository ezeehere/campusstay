import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle2,
  Heart,
  Home as HomeIcon,
  Loader2,
  LogOut,
  Save,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { logoutStudent, watchStudentAuth } from "../../firebase/studentAuth";
import {
  ensureStudentProfile,
  getStudentProfile,
  updateStudentProfile,
} from "../../firebase/students";
import StudentListingSection from "../../components/student/StudentListingSection";

const institutionOptions = [
  "",
  "JIST",
  "JEC",
  "Kaziranga ITI",
  "Ayush Pharmacy",
  "Other",
];

const initialFormData = {
  fullName: "",
  phone: "",
  college: "",
  gender: "",
  budgetMin: "",
  budgetMax: "",
  preferredArea: "",
  preferredStayType: "",
  foodRequired: "",
  preferredRoomType: "",
  moveInTime: "",
};

function isStudentPreferencesComplete(profile) {
  const minBudget = Number(profile?.budgetMin || 0);
  const maxBudget = Number(profile?.budgetMax || 0);

  return Boolean(
    profile?.college &&
    profile?.gender &&
    minBudget > 0 &&
    maxBudget > 0 &&
    profile?.preferredStayType &&
    profile?.foodRequired
  );
}

function StudentDashboard() {
  const [studentUser, setStudentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreferenceForm, setShowPreferenceForm] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const unsubscribe = watchStudentAuth(async (user) => {
      if (!user) {
        setStudentUser(null);
        setLoading(false);
        return;
      }

      setStudentUser(user);

      let studentProfile = await getStudentProfile(user.uid);

      if (!studentProfile) {
        await ensureStudentProfile(user);
        studentProfile = await getStudentProfile(user.uid);
      }

      if (studentProfile) {
        setProfile(studentProfile);

        const nextFormData = {
          fullName: studentProfile.fullName || user.displayName || "",
          phone: studentProfile.phone || "",
          college: studentProfile.college || "",
          gender: studentProfile.gender || "",
          budgetMin: studentProfile.budgetMin || "",
          budgetMax: studentProfile.budgetMax || "",
          preferredArea: studentProfile.preferredArea || "",
          preferredStayType: studentProfile.preferredStayType || "",
          foodRequired: studentProfile.foodRequired || "",
          preferredRoomType: studentProfile.preferredRoomType || "",
          moveInTime: studentProfile.moveInTime || "",
        };

        setFormData(nextFormData);
        setShowPreferenceForm(!isStudentPreferencesComplete(studentProfile));
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const preferencesComplete = isStudentPreferencesComplete(profile);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function validatePreferenceForm() {
    const minBudget = Number(formData.budgetMin || 0);
    const maxBudget = Number(formData.budgetMax || 0);

    if (!formData.college) {
      alert("Please select your nearby institution.");
      return false;
    }

    if (!formData.gender) {
      alert("Please select who the stay is for.");
      return false;
    }

    if (!minBudget || !maxBudget) {
      alert("Please enter your minimum and maximum budget.");
      return false;
    }

    if (maxBudget < minBudget) {
      alert("Maximum budget cannot be less than minimum budget.");
      return false;
    }

    if (!formData.preferredStayType) {
      alert("Please select your preferred stay type.");
      return false;
    }

    if (!formData.foodRequired) {
      alert("Please select whether food is required.");
      return false;
    }

    return true;
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    if (!studentUser) return;
    if (!validatePreferenceForm()) return;

    const minBudget = Number(formData.budgetMin || 0);
    const maxBudget = Number(formData.budgetMax || 0);

    try {
      setSaving(true);

      await ensureStudentProfile(studentUser);

      await updateStudentProfile(studentUser.uid, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        college: formData.college,
        gender: formData.gender,
        budgetMin: minBudget,
        budgetMax: maxBudget,
        preferredArea: formData.preferredArea.trim(),
        preferredStayType: formData.preferredStayType,
        foodRequired: formData.foodRequired,
        preferredRoomType: formData.preferredRoomType,
        moveInTime: formData.moveInTime.trim(),
      });

      const updatedProfile = await getStudentProfile(studentUser.uid);
      setProfile(updatedProfile);
      setShowPreferenceForm(!isStudentPreferencesComplete(updatedProfile));

      alert("Preferences saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutStudent();
      window.location.replace("/");
    } catch (error) {
      console.error(error);
      alert("Logout failed.");
    }
  }

  if (loading) {
    return (
      <main className="cs-page flex min-h-screen items-center justify-center px-3 py-4 text-slate-600">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm">
          <Loader2 className="animate-spin" size={20} />
          Loading student dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="cs-page min-h-screen px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl overflow-x-hidden">
        <header className="rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white">
                <UserRound size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#1F2933]">
                  Hi, {profile?.fullName || studentUser?.displayName || "Student"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {preferencesComplete
                    ? "Browse, save, and compare PGs near campus."
                    : "Complete your preferences first to see matched stays."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Link
                to="/student/saved"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
              >
                <Heart size={16} />
                Saved
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#123C35]"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {!preferencesComplete ? (
          <section className="mt-5 rounded-[1.5rem] border border-[#DDECE7] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
            <div className="rounded-[1.5rem] border border-[#DDECE7] bg-[#F1FAF7] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#123C35]">
                    Set your PG preferences first
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    This helps CampusStay show relevant PGs and rooms based on your
                    institution, budget, stay type, and food requirement.
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#1E5B4F] shadow-sm">
                  Required before browsing
                </div>
              </div>
            </div>

            <PreferenceForm
              formData={formData}
              saving={saving}
              onChange={handleInputChange}
              onSubmit={handleSaveProfile}
            />
          </section>
        ) : (
          <>
            <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <DashboardMiniCard
                title="Saved"
                value="View"
                description="Your shortlist"
                to="/student/saved"
                icon={<Heart size={19} />}
              />

              <DashboardMiniCard
                title="Institution"
                value={formData.college || "Any"}
                description="Nearby"
                icon={<SlidersHorizontal size={19} />}
              />

              <DashboardMiniCard
                title="Budget"
                value={`₹${formData.budgetMin || "Any"} - ₹${formData.budgetMax || "Any"
                  }`}
                description="Monthly range"
                icon={<SlidersHorizontal size={19} />}
              />

              <DashboardMiniCard
                title="Stay"
                value={formData.preferredStayType || "PG/Room"}
                description="Type"
                icon={<HomeIcon size={19} />}
              />
            </section>

            <section className="mt-5 rounded-[1.5rem] border border-[#E8DFD2] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-[#1F2933]">
                    <CheckCircle2 size={20} className="text-[#1E5B4F]" />
                    Your preference summary
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {formData.college || "Any institution"} ·{" "}
                    {formData.gender || "Any gender"} ·{" "}
                    {formData.preferredStayType || "PG or Room"} · ₹
                    {formData.budgetMin || "Any"} - ₹
                    {formData.budgetMax || "Any"} ·{" "}
                    {formData.foodRequired || "Food optional"} ·{" "}
                    {formData.preferredArea || "Any area"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreferenceForm((previous) => !previous)}
                  className="w-full rounded-2xl border border-[#E8DFD2] bg-white px-4 py-3 text-sm font-bold text-[#1E5B4F] transition hover:bg-[#F6F1E8] sm:w-auto"
                >
                  {showPreferenceForm ? "Hide preferences" : "Edit preferences"}
                </button>
              </div>

              {showPreferenceForm && (
                <PreferenceForm
                  formData={formData}
                  saving={saving}
                  onChange={handleInputChange}
                  onSubmit={handleSaveProfile}
                />
              )}
            </section>

            <StudentListingSection profile={profile} />
          </>
        )}
      </div>
    </main>
  );
}

function PreferenceForm({ formData, saving, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
      <InputField
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={onChange}
        placeholder="Your name"
      />

      <InputField
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={onChange}
        placeholder="Optional now, required when requesting callback"
      />

      <SelectField
        label="Nearby Institution"
        name="college"
        value={formData.college}
        onChange={onChange}
        options={institutionOptions}
        required
      />

      <SelectField
        label="Stay Suitable For"
        name="gender"
        value={formData.gender}
        onChange={onChange}
        options={["", "Boys", "Girls", "Co-ed"]}
        required
      />

      <InputField
        label="Minimum Budget"
        name="budgetMin"
        type="number"
        value={formData.budgetMin}
        onChange={onChange}
        placeholder="3000"
        required
      />

      <InputField
        label="Maximum Budget"
        name="budgetMax"
        type="number"
        value={formData.budgetMax}
        onChange={onChange}
        placeholder="6000"
        required
      />

      <InputField
        label="Preferred Area"
        name="preferredArea"
        value={formData.preferredArea}
        onChange={onChange}
        placeholder="JIST Gate, Sotai, Tarajan"
      />

      <SelectField
        label="Preferred Stay Type"
        name="preferredStayType"
        value={formData.preferredStayType}
        onChange={onChange}
        options={["", "PG", "Room", "Hostel", "Both"]}
        required
      />

      <SelectField
        label="Food Required"
        name="foodRequired"
        value={formData.foodRequired}
        onChange={onChange}
        options={["", "Yes", "No", "Maybe"]}
        required
      />

      <SelectField
        label="Room Sharing Preference"
        name="preferredRoomType"
        value={formData.preferredRoomType}
        onChange={onChange}
        options={[
          "",
          "Single Room",
          "Double Sharing",
          "Triple Sharing",
          "Four Sharing",
        ]}
      />

      <div className="md:col-span-2">
        <InputField
          label="Move-in Time"
          name="moveInTime"
          value={formData.moveInTime}
          onChange={onChange}
          placeholder="Immediately, within 1 month, after admission"
        />
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? "Saving..." : "Save and continue"}
        </button>
      </div>
    </form>
  );
}

function DashboardMiniCard({ title, value, description, icon, to }) {
  const content = (
    <div className="rounded-[1.35rem] border border-[#E8DFD2] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <h2 className="mt-1 line-clamp-1 text-base font-bold text-[#1F2933]">
            {value}
          </h2>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F6F1E8] text-[#1E5B4F]">
          {icon}
        </div>
      </div>
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;

  return content;
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = false }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
      >
        {options.map((option) => (
          <option key={option || "empty"} value={option}>
            {option || "Select"}
          </option>
        ))}
      </select>
    </div>
  );
}

export default StudentDashboard;