import { useUser } from "@clerk/clerk-react";

export const useHasAccess = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return false;

  const role = user.publicMetadata?.role;
  const teamId = user.publicMetadata?.teamId;

  return typeof role === "string" && typeof teamId === "string";
};
