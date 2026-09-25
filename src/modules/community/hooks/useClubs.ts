import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { communityApi } from "../services/communityApi";
import type { CreateClubInput } from "../types/Club";

const clubsQueryKey = ["community", "clubs"];

export function useClubs(page: number = 1, search: string = "") {
  return useQuery({ 
    queryKey: [...clubsQueryKey, page, search], 
    queryFn: () => communityApi.listClubs(page, search) 
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClubInput) => communityApi.createClub(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clubsQueryKey }),
  });
}

export function useJoinClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clubId: number) => communityApi.joinClub(clubId),
    onSuccess: (_data, clubId) => {
      queryClient.invalidateQueries({ queryKey: ["community", "club-members", clubId] });
    },
  });
}

export function useClub(clubId?: number) {
  return useQuery({
    queryKey: ["community", "club", clubId],
    queryFn: () => communityApi.getClub(clubId!),
    enabled: Boolean(clubId),
  });
}

export function useClubMembers(clubId?: number) {
  return useQuery({
    queryKey: ["community", "club-members", clubId],
    queryFn: () => communityApi.getClubMembers(clubId!),
    enabled: Boolean(clubId),
  });
}

export function useLeaveClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, userId }: { clubId: number; userId: number }) => communityApi.leaveClub(clubId, userId),
    onSuccess: (_data, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: ["community", "club-members", clubId] });
    },
  });
}

export function useUser(userId: number) {
  return useQuery({
    queryKey: ["community", "user", userId],
    queryFn: () => communityApi.getUser(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 60, // cache for 1 hour to avoid refetching often
  });
}
