import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";

import { auth } from "../../firebase/config";
import Home from "../../pages/public/Home";

function RoleRedirect() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setRole(localStorage.getItem("campusstay_active_role") || "");
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <main className="cs-page flex min-h-screen items-center justify-center px-4 text-slate-600">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm">
          <Loader2 className="animate-spin" size={20} />
          Loading CampusStay...
        </div>
      </main>
    );
  }

  if (user && role === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (user && role === "owner") {
    return <Navigate to="/owner/dashboard" replace />;
  }

  return <Home />;
}

export default RoleRedirect;
