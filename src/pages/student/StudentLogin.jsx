import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Home as HomeIcon, Loader2, LogIn, UserPlus } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";

import {
  loginStudentWithEmail,
  loginStudentWithGoogle,
  registerStudentWithEmail,
} from "../../firebase/studentAuth";

function StudentLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function goAfterLogin() {
    navigate("/student/dashboard", { replace: true });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const activeRole = localStorage.getItem("campusstay_active_role");

      if (activeRole === "student") {
        navigate("/student/dashboard", { replace: true });
      } else if (activeRole === "owner") {
        navigate("/owner/dashboard", { replace: true });
      } else if (activeRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      setErrorMessage("");
      await loginStudentWithGoogle();
      goAfterLogin();
    } catch (error) {
      console.error(error);
      setErrorMessage("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    if (mode === "register" && !fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      if (mode === "register") {
        await registerStudentWithEmail(fullName.trim(), email.trim(), password);
      } else {
        await loginStudentWithEmail(email.trim(), password);
      }

      goAfterLogin();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        mode === "register"
          ? "Account creation failed. Try another email or password."
          : "Login failed. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8EF] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[2rem] bg-[#1E5B4F] p-8 text-white shadow-sm sm:p-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <HomeIcon size={16} />
              Back to CampusStay
            </Link>

            <div className="mt-16 max-w-xl">
              <p className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white w-fit">
                Student Account
              </p>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
                Save PGs, set preferences, and get better room matches.
              </h1>

              <p className="mt-5 text-base leading-7 text-white/80">
                Students can save listings, manage preferences, write reviews,
                and help CampusStay understand real accommodation demand near
                campus.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#E8DFD2] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex rounded-2xl bg-[#F6F1E8] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                }}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  mode === "login"
                    ? "bg-white text-[#1E5B4F] shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage("");
                }}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  mode === "register"
                    ? "bg-white text-[#1E5B4F] shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mt-7">
              <h2 className="text-2xl font-extrabold text-[#1F2933]">
                {mode === "login" ? "Student Login" : "Create Student Account"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Login is required only for saving PGs, preferences, reviews,
                and callback requests.
              </p>
            </div>

            {errorMessage && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E8DFD2] bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#F6F1E8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E8DFD2]" />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                or
              </span>
              <div className="h-px flex-1 bg-[#E8DFD2]" />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 py-3 text-sm outline-none focus:border-[#1E5B4F]"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C35] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : mode === "login" ? (
                  <LogIn size={18} />
                ) : (
                  <UserPlus size={18} />
                )}

                {mode === "login" ? "Login" : "Create Account"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default StudentLogin;