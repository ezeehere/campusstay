import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";

import { watchOwnerAuth } from "../../firebase/ownerAuth";

function ProtectedOwnerRoute({ children }) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [ownerUser, setOwnerUser] = useState(null);

  useEffect(() => {
    const unsubscribe = watchOwnerAuth((user) => {
      setOwnerUser(user);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
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
    return <Navigate to="/owner/login" replace />;
  }

  return children;
}

export default ProtectedOwnerRoute;
