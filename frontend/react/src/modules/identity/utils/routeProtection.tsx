
import { ROUTE_POLICY } from "@app/routePolicy";
import { ProtectedRoute } from "@modules/identity";


export const withRouteProtection = (
  path: keyof typeof ROUTE_POLICY,
  element: React.ReactNode
) => {
  return ROUTE_POLICY[path] === "PROTECTED" ? (
    <ProtectedRoute>{element}</ProtectedRoute>
  ) : (
    element
  );
};