import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Character, InsertCharacter, UpdateCharacter, SessionLog, InsertSessionLog, UpdateSessionLog } from "@shared/schema";

// Character hooks
export function useCharacters() {
  return useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });
}

export function useCharacter(id: number) {
  return useQuery<Character>({
    queryKey: [`/api/characters/${id}`],
    enabled: !!id,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertCharacter): Promise<Character> => {
      const response = await apiRequest("/api/characters", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateCharacter }): Promise<Character> => {
      const response = await apiRequest(`/api/characters/${id}`, "PATCH", updates);
      return response.json();
    },
    onSuccess: (updatedCharacter) => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      queryClient.setQueryData([`/api/characters/${updatedCharacter.id}`], updatedCharacter);
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiRequest(`/api/characters/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
    },
  });
}

// Session log hooks
export function useSessionLogs(characterId: number) {
  return useQuery<SessionLog[]>({
    queryKey: [`/api/characters/${characterId}/sessions`],
    enabled: !!characterId,
  });
}

export function useCreateSessionLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertSessionLog): Promise<SessionLog> => {
      const response = await apiRequest("/api/sessions", "POST", data);
      return response.json();
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/characters/${newSession.characterId}/sessions`] 
      });
    },
  });
}

export function useUpdateSessionLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateSessionLog }): Promise<SessionLog> => {
      const response = await apiRequest(`/api/sessions/${id}`, "PATCH", updates);
      return response.json();
    },
    onSuccess: (updatedSession) => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/characters/${updatedSession.characterId}/sessions`] 
      });
    },
  });
}

export function useDeleteSessionLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiRequest(`/api/sessions/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
    },
  });
}
