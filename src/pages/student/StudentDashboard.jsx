import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
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

function StudentDashboard() {
  const navigate = useNavigate();

  const [studentUser, setStudentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreferenceForm, setShowPreferenceForm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    college: "JIST",
    gender: "",
    budgetMin: "",
    budgetMax: "",
    preferredArea: "",
    preferredStayType: "",
    foodRequired: "",
    preferredRoomType: "",
    moveInTime: "",
  });

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

        setFormData({
          fullName: studentProfile.fullName || user.displayName || "",
          phone: studentProfile.phone || "",
          college: studentProfile.college || "JIST",
          gender: studentProfile.gender || "",
          budgetMin: studentProfile.budgetMin || "",
          budgetMax: studentProfile.budgetMax || "",
          preferredArea: studentProfile.preferredArea || "",
          preferredStayType: studentProfile.preferredStayType || "",
          foodRequired: studentProfile.foodRequired || "",
          preferredRoomType: studentProfile.preferredRoomType || "",
          moveInTime: studentProfile.moveInTime || "",
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    if (!studentUser) return;

    const minBudget = Number(formData.budgetMin || 0);
    const maxBudget = Number(formData.budgetMax || 0);

    if (minBudget && maxBudget && maxBudget < minBudget) {
      alert("Maximum budget cannot be less than minimum budget.");
      return;
    }

    try {
      setSaving(true);
      await ensureStudentProfile(studentUser);
      await updateStudentProfile(studentUser.uid, {
        ...formData,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : "",
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : "",
      });

      const updatedProfile = await getStudentProfile(studentUser.uid);
      setProfile(updatedProfile);
      setShowPreferenceForm(false);

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
                  Browse, save, and compare PGs near campus.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
              >
                <HomeIcon size={16} />
                Home
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

        <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DashboardMiniCard
            title="Saved"
            value="View"
            description="Your shortlist"
            to="/student/saved"
            icon={<Heart size={19} />}
          />

          <DashboardMiniCard
            title="Area"
            value={formData.preferredArea || "Any"}
            description="Preference"
            icon={<SlidersHorizontal size={19} />}
          />

          <DashboardMiniCard
            title="Budget"
            value={`₹${formData.budgetMin || "Any"} - ₹${formData.budgetMax || "Any"}`}
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
              <h2 className="text-xl font-bold text-[#1F2933]">
                Your preference summary
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {formData.gender || "Any gender"} ·{" "}
                {formData.preferredStayType || "PG or Room"} · ₹
                {formData.budgetMin || "Any"} - ₹{formData.budgetMax || "Any"} ·{" "}
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
            <form
              onSubmit={handleSaveProfile}
              className="mt-5 grid gap-4 md:grid-cols-2"
            >
              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />

              <InputField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Optional"
              />

              <SelectField
                label="College"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                options={["JIST", "JEC", "Other"]}
              />

              <SelectField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                options={["", "Boys", "Girls", "All"]}
              />

              <InputField
                label="Minimum Budget"
                name="budgetMin"
                type="number"
                value={formData.budgetMin}
                onChange={handleInputChange}
                placeholder="3000"
              />

              <InputField
                label="Maximum Budget"
                name="budgetMax"
                type="number"
                value={formData.budgetMax}
                onChange={handleInputChange}
                placeholder="6000"
              />

              <InputField
                label="Preferred Area"
                name="preferredArea"
                value={formData.preferredArea}
                onChange={handleInputChange}
                placeholder="JIST Gate, Sotai, Tarajan"
              />

              <SelectField
                label="Preferred Stay Type"
                name="preferredStayType"
                value={formData.preferredStayType}
                onChange={handleInputChange}
                options={["", "PG", "Room", "Both"]}
              />

              <SelectField
                label="Food Required"
                name="foodRequired"
                value={formData.foodRequired}
                onChange={handleInputChange}
                options={["", "Yes", "No", "Maybe"]}
              />

              <SelectField
                label="Room Sharing Preference"
                name="preferredRoomType"
                value={formData.preferredRoomType}
                onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  placeholder="Immediately, within 1 month, after admission"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save preferences
                </button>
              </div>
            </form>
          )}
        </section>

        <StudentListingSection profile={profile} />


      </div>
    </main>
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
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
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