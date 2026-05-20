import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";

import { watchAuthState } from "../../firebase/auth";

function ProtectedAdminRoute({ children }) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const unsubscribe = watchAuthState((user) => {
      setAdminUser(user);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 shadow-sm">
          <Loader2 className="animate-spin" size={22} />
          Checking admin access...
        </div>
      </main>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;