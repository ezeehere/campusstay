import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";

import { watchStudentAuth } from "../../firebase/studentAuth";
import { getStudentProfile } from "../../firebase/students";
import { resolveUserRole } from "../../firebase/userRoles";
import { buildStudentLoginUrl } from "../../utils/loginRedirect";

function ProtectedStudentRoute({ children }) {
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [studentUser, setStudentUser] = useState(null);
  const [studentAllowed, setStudentAllowed] = useState(false);
  const [redirectTo, setRedirectTo] = useState("");

  useEffect(() => {
    let isActive = true;

    const unsubscribe = watchStudentAuth(async (user) => {
      if (!isActive) return;

      setCheckingAuth(true);
      setStudentUser(user);
      setStudentAllowed(false);
      setRedirectTo("");

      if (!user) {
        setCheckingAuth(false);
        return;
      }

      try {
        const studentProfile = await getStudentProfile(user.uid);

        if (!isActive) return;

        if (studentProfile) {
          setStudentAllowed(true);
          setCheckingAuth(false);
          return;
        }

        const role = await resolveUserRole(user);

        if (!isActive) return;

        if (role === "owner") {
          setRedirectTo("/owner/dashboard");
        } else if (role === "admin") {
          setRedirectTo("/admin/dashboard");
        } else {
          setRedirectTo("/");
        }
      } catch (error) {
        console.error("Could not verify student access:", error);
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
          Checking student login...
        </div>
      </main>
    );
  }

  if (!studentUser) {
    return <Navigate to={buildStudentLoginUrl({ returnTo })} replace />;
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!studentAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedStudentRoute;
