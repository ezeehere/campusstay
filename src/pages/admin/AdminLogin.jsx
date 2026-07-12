import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Home as HomeIcon, Loader2, Lock } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";

import { loginAdmin, logoutAdmin } from "../../firebase/auth";
import { checkIsAdmin } from "../../firebase/admins";
import { clearStoredRole, resolveUserRole, setStoredRole } from "../../firebase/userRoles";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const role = await resolveUserRole(user);

        if (role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Could not resolve admin login role:", error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoginLoading(true);
      setErrorMessage("");

      const result = await loginAdmin(email, password);
      const isAdmin = await checkIsAdmin(result.user.uid);

      if (!isAdmin) {
        clearStoredRole();
        await logoutAdmin();
        setErrorMessage("This account does not have admin access.");
        return;
      }

      setStoredRole("admin");
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      console.error("Admin login error:", error);
      clearStoredRole();
      setErrorMessage("Login failed. Check your email and password.");
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF8EF] via-white to-[#F6F1E8] text-slate-950">
      <header className="border-b border-[#E8DFD2] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E5B4F] text-white shadow-sm">
              <HomeIcon size={22} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">CampusStay</h1>
              <p className="text-xs text-slate-500">Admin panel</p>
            </div>
          </Link>

          <Link
            to="/"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#FFF8EF]"
          >
            Back to site
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] border border-[#E8DFD2] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#1E5B4F] text-white">
            <Lock size={24} />
          </div>

          <h2 className="text-3xl font-black tracking-tight">Admin Login</h2>

          <p className="mt-3 text-slate-600">
            Login to review submitted listings and manage CampusStay data.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@campusstay.in"
                required
                className="h-12 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
                className="h-12 w-full rounded-2xl border border-[#E8DFD2] bg-[#FFF8EF] px-4 outline-none focus:border-slate-400"
              />
            </div>

            <button
              disabled={loginLoading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#1E5B4F] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#123C35] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginLoading && <Loader2 size={17} className="animate-spin" />}
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default AdminLogin;
