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
  getStudentProfile,
  updateStudentProfile,
} from "../../firebase/students";
import StudentListingSection from "../../components/student/StudentListingSection";
import { institutions } from "../../config/institutions";

const TERMS_VERSION = "2026-07-terms-v1";
const PRIVACY_VERSION = "2026-07-privacy-v1";

const initialFormData = {
  fullName: "",
  phone: "",
  institutionId: "",
  institutionName: "",
  college: "",
  gender: "",
  budgetMin: 3000,
  budgetMax: 6000,
  preferredArea: "",
  preferredAreas: [],
  preferredStayType: "",
  foodRequired: "",
  preferredRoomType: "",
  moveInTime: "",
  termsAccepted: false,
  termsVersion: TERMS_VERSION,
  privacyAccepted: false,
  privacyVersion: PRIVACY_VERSION,
};

function getSavedPreferredAreas(profile) {
  if (Array.isArray(profile?.preferredAreas)) {
    return profile.preferredAreas;
  }

  if (profile?.preferredArea) {
    return String(profile.preferredArea)
      .split(",")
      .map((area) => area.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeInstitutionValue(value) {
  return String(value || "").toLowerCase().trim();
}

function getInstitutionFromValue(value) {
  const cleanValue = normalizeInstitutionValue(value);

  if (!cleanValue) return null;

  return (
    institutions.find((institution) => {
      return [
        institution.id,
        institution.shortName,
        institution.fullName,
        institution.heroLabel,
      ]
        .map(normalizeInstitutionValue)
        .includes(cleanValue);
    }) || null
  );
}

function getInstitutionDisplay(data) {
  return data?.institutionName || data?.college || "";
}

function getAreaSummary(formData) {
  if (Array.isArray(formData.preferredAreas) && formData.preferredAreas.length > 0) {
    return formData.preferredAreas.join(", ");
  }

  return formData.preferredArea || "Any area";
}
function isStudentPreferencesComplete(profile) {
  const minBudget = Number(profile?.budgetMin || 0);
  const maxBudget = Number(profile?.budgetMax || 0);
  const selectedInstitution =
    profile?.institutionId || profile?.institutionName || profile?.college;

  return Boolean(
    profile?.fullName &&
    profile?.phone &&
    selectedInstitution &&
    profile?.gender &&
    minBudget > 0 &&
    maxBudget > 0 &&
    maxBudget >= minBudget &&
    profile?.preferredStayType &&
    profile?.foodRequired &&
    profile?.termsAccepted === true &&
    profile?.privacyAccepted === true
  );
}

function StudentDashboard() {
  const [studentUser, setStudentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreferenceForm, setShowPreferenceForm] = useState(false);
  const [missingProfile, setMissingProfile] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const unsubscribe = watchStudentAuth(async (user) => {
      if (!user) {
        setStudentUser(null);
        setProfile(null);
        setMissingProfile(false);
        setLoading(false);
        return;
      }

      setStudentUser(user);
      setMissingProfile(false);

      const studentProfile = await getStudentProfile(user.uid);

      if (!studentProfile) {
        setProfile(null);
        setMissingProfile(true);
        setLoading(false);
        return;
      }

      if (studentProfile) {
        setProfile(studentProfile);

        const selectedInstitution = getInstitutionFromValue(
          studentProfile.institutionId ||
            studentProfile.institutionName ||
            studentProfile.college
        );

        const nextFormData = {
          fullName: studentProfile.fullName || user.displayName || "",
          phone: studentProfile.phone || "",
          institutionId: studentProfile.institutionId || selectedInstitution?.id || "",
          institutionName:
            studentProfile.institutionName || selectedInstitution?.fullName || "",
          college: studentProfile.college || selectedInstitution?.heroLabel || "",
          gender: studentProfile.gender || "",
          budgetMin: studentProfile.budgetMin || 3000,
          budgetMax: studentProfile.budgetMax || 6000,
          preferredArea: studentProfile.preferredArea || "",
          preferredAreas: getSavedPreferredAreas(studentProfile),
          preferredStayType: studentProfile.preferredStayType || "",
          foodRequired: studentProfile.foodRequired || "",
          preferredRoomType: studentProfile.preferredRoomType || "",
          moveInTime: studentProfile.moveInTime || "",
          termsAccepted: studentProfile.termsAccepted === true,
          termsVersion: studentProfile.termsVersion || TERMS_VERSION,
          privacyAccepted: studentProfile.privacyAccepted === true,
          privacyVersion: studentProfile.privacyVersion || PRIVACY_VERSION,
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
    const { checked, name, type, value } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setFormData((previousData) => {
      if (name === "institutionId") {
        const selectedInstitution = getInstitutionFromValue(nextValue);

        return {
          ...previousData,
          institutionId: selectedInstitution?.id || "",
          institutionName: selectedInstitution?.fullName || "",
          college: selectedInstitution?.heroLabel || "",
          preferredArea: "",
          preferredAreas: [],
        };
      }

      return {
        ...previousData,
        [name]: nextValue,
      };
    });
  }

  function handleSingleSelect(name, value) {
    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handlePreferredAreaToggle(area) {
    setFormData((previousData) => {
      const currentAreas = Array.isArray(previousData.preferredAreas)
        ? previousData.preferredAreas
        : [];

      const nextAreas = currentAreas.includes(area)
        ? currentAreas.filter((item) => item !== area)
        : [...currentAreas, area];

      return {
        ...previousData,
        preferredArea: nextAreas.join(", "),
        preferredAreas: nextAreas,
      };
    });
  }

  function validatePreferenceForm() {
    const minBudget = Number(formData.budgetMin || 0);
    const maxBudget = Number(formData.budgetMax || 0);

    if (!formData.fullName.trim()) {
      alert("Please enter your full name.");
      return false;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your phone number.");
      return false;
    }

    if (!formData.institutionId) {
      alert("Please select your nearby institution.");
      return false;
    }

    if (!formData.gender) {
      alert("Please select who the stay is for.");
      return false;
    }

    if (!minBudget || !maxBudget || minBudget <= 0 || maxBudget <= 0) {
      alert("Please enter a valid minimum and maximum budget.");
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

    if (formData.termsAccepted !== true || formData.privacyAccepted !== true) {
      alert("Please accept the Terms & Conditions and Privacy Policy before saving your preferences.");
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
    const preferredAreas = Array.isArray(formData.preferredAreas)
      ? formData.preferredAreas
      : [];
    const selectedInstitution = getInstitutionFromValue(formData.institutionId);

    try {
      setSaving(true);

      await updateStudentProfile(studentUser.uid, {
        fullName: formData.fullName.trim(),
        email: studentUser.email || "",
        phone: formData.phone.trim(),
        institutionId: selectedInstitution?.id || formData.institutionId,
        institutionName: selectedInstitution?.fullName || formData.institutionName,
        college: selectedInstitution?.heroLabel || formData.college,
        gender: formData.gender,
        budgetMin: minBudget,
        budgetMax: maxBudget,
        preferredArea: preferredAreas.join(", "),
        preferredAreas,
        preferredStayType: formData.preferredStayType,
        foodRequired: formData.foodRequired,
        preferredRoomType: formData.preferredRoomType,
        moveInTime: String(formData.moveInTime || "").trim(),
        termsAccepted: formData.termsAccepted === true,
        termsVersion: TERMS_VERSION,
        privacyAccepted: formData.privacyAccepted === true,
        privacyVersion: PRIVACY_VERSION,
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

  if (missingProfile) {
    return (
      <main className="cs-page flex min-h-screen items-center justify-center px-3 py-4 text-slate-600">
        <section className="w-full max-w-md rounded-[1.5rem] border border-[#E8DFD2] bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6F1E8] text-[#1E5B4F]">
            <UserRound size={22} />
          </div>

          <h1 className="mt-4 text-xl font-bold text-[#1F2933]">
            Student profile not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please sign in through the student login page so CampusStay can set up your student account.
          </p>

          <Link
            to="/student/login?returnTo=/student/dashboard"
            className="mt-5 inline-flex rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35]"
          >
            Go to student login
          </Link>
        </section>
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
              onSingleSelect={handleSingleSelect}
              onToggleArea={handlePreferredAreaToggle}
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
                value={getInstitutionDisplay(formData) || "Any"}
                description="Nearby"
                icon={<SlidersHorizontal size={19} />}
              />

              <DashboardMiniCard
                title="Budget"
                value={`â‚¹${formData.budgetMin || "Any"} - â‚¹${formData.budgetMax || "Any"
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
                    {getInstitutionDisplay(formData) || "Any institution"} Â·{" "}
                    {formData.gender || "Any gender"} Â·{" "}
                    {formData.preferredStayType || "PG or Room"} Â· â‚¹
                    {formData.budgetMin || "Any"} - â‚¹
                    {formData.budgetMax || "Any"} Â·{" "}
                    {formData.foodRequired || "Food optional"} Â·{" "}
                    {getAreaSummary(formData)}
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
                  onSingleSelect={handleSingleSelect}
                  onToggleArea={handlePreferredAreaToggle}
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

function PreferenceForm({
  formData,
  saving,
  onChange,
  onSubmit,
  onSingleSelect,
  onToggleArea,
}) {
  const selectedInstitution = getInstitutionFromValue(
    formData.institutionId || formData.institutionName || formData.college
  );
  const areaOptions = selectedInstitution?.areas || institutions[0].areas;
  const preferredAreas = Array.isArray(formData.preferredAreas)
    ? formData.preferredAreas
    : [];
  const institutionOptions = [
    { value: "", label: "Select" },
    ...institutions
      .filter((institution) => institution.id !== "all")
      .map((institution) => ({
        value: institution.id,
        label: institution.heroLabel,
      })),
  ];

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
      <InputField
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={onChange}
        placeholder="Your name"
        required
      />

      <InputField
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={onChange}
        placeholder="Enter your phone number"
        required
      />

      <SelectField
        label="Nearby Institution"
        name="institutionId"
        value={formData.institutionId}
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

      <div className="md:col-span-2">
        <ChipGroup
          label="Preferred Areas"
          options={areaOptions}
          selectedValues={preferredAreas}
          onToggle={onToggleArea}
        />
      </div>

      <SelectField
        label="Preferred Stay Type"
        name="preferredStayType"
        value={formData.preferredStayType}
        onChange={onChange}
        options={["", "PG", "Room", "Hostel", "Both"]}
        required
      />

      <ChipGroup
        label="Food Required"
        options={["Yes", "No", "Maybe"]}
        selectedValues={[formData.foodRequired].filter(Boolean)}
        onSelect={(value) => onSingleSelect("foodRequired", value)}
        required
      />

      <ChipGroup
        label="Room Sharing Preference"
        options={[
          "Single Room",
          "Double Sharing",
          "Triple Sharing",
          "Four Sharing",
        ]}
        selectedValues={[formData.preferredRoomType].filter(Boolean)}
        onSelect={(value) => onSingleSelect("preferredRoomType", value)}
      />

      <div className="md:col-span-2">
        <ChipGroup
          label="Move-in Time"
          options={[
            "Immediately",
            "Within 1 month",
            "After admission",
            "Not sure yet",
          ]}
          selectedValues={[formData.moveInTime].filter(Boolean)}
          onSelect={(value) => onSingleSelect("moveInTime", value)}
        />
      </div>

      <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] p-4 text-sm text-slate-700">
        <input
          type="checkbox"
          name="termsAccepted"
          checked={formData.termsAccepted === true}
          onChange={onChange}
          required
          className="mt-1 h-4 w-4 rounded border-[#E8DFD2] accent-[#1E5B4F]"
        />
        <span>
          I agree to the CampusStay{" "}
          <Link to="/terms" className="font-bold text-[#1E5B4F] underline">
            Terms & Conditions
          </Link>
        </span>
      </label>

      <label className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] p-4 text-sm text-slate-700">
        <input
          type="checkbox"
          name="privacyAccepted"
          checked={formData.privacyAccepted === true}
          onChange={onChange}
          required
          className="mt-1 h-4 w-4 rounded border-[#E8DFD2] accent-[#1E5B4F]"
        />
        <span>
          I have read and agree to the CampusStay{" "}
          <Link to="/privacy" className="font-bold text-[#1E5B4F] underline">
            Privacy Policy
          </Link>
        </span>
      </label>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? "Saving..." : "Show matching stays"}
        </button>
      </div>
    </form>
  );
}

function ChipGroup({
  label,
  options,
  selectedValues,
  onSelect,
  onToggle,
  required = false,
}) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = selectedValues.includes(option);

          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                if (onToggle) {
                  onToggle(option);
                  return;
                }

                onSelect(selected ? "" : option);
              }}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                selected
                  ? "border-[#1E5B4F] bg-[#1E5B4F] text-white"
                  : "border-[#E8DFD2] bg-[#FFF8EF] text-slate-700 hover:bg-white"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
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
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;

          return (
            <option key={optionValue || "empty"} value={optionValue}>
              {optionLabel || "Select"}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default StudentDashboard;









