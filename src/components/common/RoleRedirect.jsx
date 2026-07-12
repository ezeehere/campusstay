import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";

import Home from "../../pages/public/Home";
import { auth } from "../../firebase/config";
import { clearStoredRole, resolveUserRole } from "../../firebase/userRoles";

function RoleRedirect() {
  const [checking, setChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState("");

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!isActive) return;
        clearStoredRole();
        setRedirectTo("");
        setChecking(false);
        return;
      }

      try {
        const role = await resolveUserRole(user);

        if (!isActive) return;

        if (role === "admin") {
          setRedirectTo("/admin/dashboard");
        } else if (role === "owner") {
          setRedirectTo("/owner/dashboard");
        } else if (role === "student") {
          setRedirectTo("/student/dashboard");
        } else {
          clearStoredRole();
          setRedirectTo("");
        }
      } catch (error) {
        console.error("Could not resolve user role:", error);
        clearStoredRole();
        setRedirectTo("");
      } finally {
        if (isActive) {
          setChecking(false);
        }
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EF] px-4 text-slate-600">
        <div className="rounded-3xl bg-white px-5 py-4 text-sm font-bold shadow-sm">
          Loading CampusStay...
        </div>
      </main>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Home />;
}

export default RoleRedirect;
