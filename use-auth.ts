import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/logout", "POST");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/status"], { authenticated: false });
      queryClient.clear(); // Clear all cached data on logout
    },
  });

  return {
    user: data?.user,
    isAuthenticated: data?.authenticated ?? false,
    isLoading,
    isMaster: data?.user?.role === "master",
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}