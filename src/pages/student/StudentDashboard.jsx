import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Heart,
  Home as HomeIcon,
  Loader2,
  LogOut,
  Save,
  UserRound,
} from "lucide-react";

import { logoutStudent, watchStudentAuth } from "../../firebase/studentAuth";
import { getStudentProfile, updateStudentProfile } from "../../firebase/students";
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
    foodRequired: "",
    preferredStayType: "",
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

      const studentProfile = await getStudentProfile(user.uid);

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
          foodRequired: studentProfile.foodRequired || "",
          preferredStayType: studentProfile.preferredStayType || "",
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
    const minBudget = Number(formData.budgetMin || 0);
    const maxBudget = Number(formData.budgetMax || 0);

    if (minBudget && maxBudget && maxBudget < minBudget) {
      alert("Maximum budget cannot be less than minimum budget.");
      return;
    }

    if (!studentUser) return;

    try {
      setSaving(true);

      await updateStudentProfile(studentUser.uid, {
        ...formData,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : "",
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : "",
      });

      const updatedProfile = await getStudentProfile(studentUser.uid);
      setProfile(updatedProfile);

      alert("Preferences saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logoutStudent();
    navigate("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EF] text-slate-600">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 shadow-sm">
          <Loader2 className="animate-spin" size={22} />
          Loading student dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8EF] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-[#E8DFD2] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white">
              <UserRound size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-[#1F2933]">
                Student Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Manage your PG preferences and saved stays.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8]"
            >
              <HomeIcon size={16} />
              Home
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1E5B4F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#123C35]"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Logged in as</p>
            <h2 className="mt-2 text-xl font-extrabold text-[#1F2933]">
              {profile?.fullName || studentUser?.displayName || "Student"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{studentUser?.email}</p>
          </div>

          <Link
            to="/student/saved"
            className="rounded-[2rem] border border-[#E8DFD2] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm font-bold text-slate-500">Saved PGs</p>
            <h2 className="mt-2 flex items-center gap-2 text-xl font-extrabold text-[#1F2933]">
              <Heart size={20} />
              View saved listings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Check the PGs and rooms you saved while browsing.
            </p>
          </Link>

          <div className="rounded-[2rem] border border-[#E8DFD2] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Preferences</p>
            <h2 className="mt-2 text-xl font-extrabold text-[#1F2933]">
              {formData.preferredArea || "Not set"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Area and budget help us understand demand.
            </p>
          </div>
        </section>

        <StudentListingSection profile={profile} />

        <section className="mt-6 rounded-[2rem] border border-[#E8DFD2] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1F2933]">
                Your Preference Summary
              </h2>
              <p className="mt-2 text-sm text-slate-500">
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
              className="rounded-2xl border border-[#E8DFD2] bg-white px-4 py-2 text-sm font-bold text-[#1E5B4F] transition hover:bg-[#F6F1E8]"
            >
              {showPreferenceForm ? "Hide preferences" : "Edit preferences"}
            </button>
          </div>

          {showPreferenceForm && (
            <form onSubmit={handleSaveProfile} className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Full Name
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Phone Number
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                College
              </label>
              <select
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
              >
                <option value="JIST">JIST</option>
                <option value="JEC">JEC</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
              >
                <option value="">Select</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="All">All</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Minimum Budget
              </label>
              <input
                name="budgetMin"
                type="number"
                value={formData.budgetMin}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Maximum Budget
              </label>
              <input
                name="budgetMax"
                type="number"
                value={formData.budgetMax}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
                placeholder="8000"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Preferred Area
              </label>
              <input
                name="preferredArea"
                value={formData.preferredArea}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
                placeholder="JIST Gate, Sotai, Tarajan"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Food Required
              </label>
              <select
                name="foodRequired"
                value={formData.foodRequired}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Maybe">Maybe</option>
              </select>
            </div>

            <div>
                <label className="text-sm font-bold text-slate-700">
                    Preferred Stay Type
                </label>
                <select
                    name="preferredStayType"
                    value={formData.preferredStayType}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
                >
                    <option value="">Select</option>
                    <option value="PG">PG</option>
                    <option value="Room">Room</option>
                    <option value="Both">Both</option>
                </select>
                </div>

                <div>
                <label className="text-sm font-bold text-slate-700">
                    Room Sharing Preference
                </label>
                <select
                    name="preferredRoomType"
                    value={formData.preferredRoomType}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
                >
                    <option value="">Select</option>
                    <option value="Single Room">Single Room</option>
                    <option value="Double Sharing">Double Sharing</option>
                    <option value="Triple Sharing">Triple Sharing</option>
                    <option value="Four Sharing">Four Sharing</option>
                </select>
                </div>

         

            <div>
              <label className="text-sm font-bold text-slate-700">
                Move-in Time
              </label>
              <input
                name="moveInTime"
                value={formData.moveInTime}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
                placeholder="Immediately, within 1 month, after admission"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Preferences
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
    </main>
  );
}

export default StudentDashboard;