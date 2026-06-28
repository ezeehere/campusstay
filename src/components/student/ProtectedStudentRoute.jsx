import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";

import { watchStudentAuth } from "../../firebase/studentAuth";

function ProtectedStudentRoute({ children }) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [studentUser, setStudentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = watchStudentAuth((user) => {
      setStudentUser(user);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
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
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedStudentRoute;