import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";

import { watchOwnerAuth } from "../../firebase/ownerAuth";
import { getOwnerProfile } from "../../firebase/owners";
import { resolveUserRole } from "../../firebase/userRoles";

function ProtectedOwnerRoute({ children }) {
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [ownerUser, setOwnerUser] = useState(null);
  const [ownerAllowed, setOwnerAllowed] = useState(false);
  const [redirectTo, setRedirectTo] = useState("");

  useEffect(() => {
    let isActive = true;

    const unsubscribe = watchOwnerAuth(async (user) => {
      if (!isActive) return;

      setCheckingAuth(true);
      setOwnerUser(user);
      setOwnerAllowed(false);
      setRedirectTo("");

      if (!user) {
        setCheckingAuth(false);
        return;
      }

      try {
        const ownerProfile = await getOwnerProfile(user.uid);

        if (!isActive) return;

        if (ownerProfile) {
          setOwnerAllowed(true);
          setCheckingAuth(false);
          return;
        }

        const role = await resolveUserRole(user);

        if (!isActive) return;

        if (role === "student") {
          setRedirectTo("/student/dashboard");
        } else if (role === "admin") {
          setRedirectTo("/admin/dashboard");
        } else {
          setRedirectTo("/");
        }
      } catch (error) {
        console.error("Could not verify owner access:", error);
        setRedirectTo("/");
      } finally {
        if (isActive) {
          setCheckingAuth(false);
        }
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EF] text-slate-600">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 shadow-sm">
          <Loader2 className="animate-spin" size={22} />
          Checking owner login...
        </div>
      </main>
    );
  }

  if (!ownerUser) {
    const params = new URLSearchParams({ returnTo });

    return <Navigate to={`/owner/login?${params.toString()}`} replace />;
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!ownerAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedOwnerRoute;
