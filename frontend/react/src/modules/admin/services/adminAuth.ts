import { jwtDecode } from "jwt-decode";
import { queryClient } from "../utils/queryClient";
import { adminLogout } from "../api/admin-service";
const ADMIN_TOKEN_KEY = "admin_access_token";
interface JwtPayload {
  exp?: number;
}
export const logout = async (): Promise<void> => {
  try {
    await adminLogout();

    queryClient.clear();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};