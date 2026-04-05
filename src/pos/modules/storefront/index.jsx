// Storefront module entry — auto-navigates to storefront:dashboard
import { useEffect } from "react";
import { useApp } from "../../AppContext";

export default function StorefrontModule() {
  const { dispatch } = useApp();
  useEffect(() => {
    dispatch({ type: "NAV", mod: "storefront", page: "dashboard" });
  }, [dispatch]);
  return null;
}
