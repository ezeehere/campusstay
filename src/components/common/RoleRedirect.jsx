import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";

import Home from "../../pages/public/Home";
import { auth } from "../../firebase/config";

function RoleRedirect() {
  const [checking, setChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setRedirectTo("");
        setChecking(false);
        return;
      }

      const activeRole = localStorage.getItem("campusstay_active_role");

      if (activeRole === "student") {
        setRedirectTo("/student/dashboard");
      } else if (activeRole === "owner") {
        setRedirectTo("/owner/dashboard");
      } else if (activeRole === "admin") {
        setRedirectTo("/admin/dashboard");
      } else {
        setRedirectTo("");
      }

      setChecking(false);
    });

    return () => unsubscribe();
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