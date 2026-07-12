import { checkIsAdmin } from "./admins";
import { getOwnerProfile } from "./owners";
import { getStudentProfile } from "./students";

const ROLE_STORAGE_KEY = "campusstay_active_role";
const ROLE_PRIORITY = ["admin", "owner", "student"];

function isValidRole(role) {
  return ROLE_PRIORITY.includes(role);
}

function canUseStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

export function readStoredRole() {
  if (!canUseStorage()) return "";

  try {
    const role = window.localStorage.getItem(ROLE_STORAGE_KEY);
    return isValidRole(role) ? role : "";
  } catch {
    return "";
  }
}

export function setStoredRole(role) {
  if (!canUseStorage()) return;

  if (!isValidRole(role)) {
    clearStoredRole();
    return;
  }

  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function clearStoredRole() {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(ROLE_STORAGE_KEY);
}

export async function resolveUserRole(user) {
  if (!user?.uid) {
    clearStoredRole();
    return "";
  }

  const storedRole = readStoredRole();
  const [isAdmin, ownerProfile, studentProfile] = await Promise.all([
    checkIsAdmin(user.uid),
    getOwnerProfile(user.uid),
    getStudentProfile(user.uid),
  ]);

  const verifiedRoles = {
    admin: isAdmin,
    owner: Boolean(ownerProfile),
    student: Boolean(studentProfile),
  };

  if (storedRole && verifiedRoles[storedRole]) {
    setStoredRole(storedRole);
    return storedRole;
  }

  const resolvedRole = ROLE_PRIORITY.find((role) => verifiedRoles[role]);

  if (resolvedRole) {
    setStoredRole(resolvedRole);
    return resolvedRole;
  }

  clearStoredRole();
  return "";
}
