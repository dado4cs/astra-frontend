import { useMutation, useQuery } from "@tanstack/react-query";

import { communityApi } from "../services/communityApi";
import type { CreateWatchRoomInput, PlaybackUpdate } from "../types/WatchRoom";

export function useWatchRoom(code?: string) {
  return useQuery({ 
    queryKey: ["community", "watch-room", code], 
    queryFn: () => communityApi.getWatchRoom(code!), 
    enabled: Boolean(code),
    refetchInterval: 3000 
  });
}

export function useCreateWatchRoom() {
  return useMutation({ mutationFn: (input: CreateWatchRoomInput) => communityApi.createWatchRoom(input) });
}

export function useUpdatePlayback() {
  return useMutation({ mutationFn: ({ roomId, input }: { roomId: string; input: PlaybackUpdate }) => communityApi.updatePlayback(roomId, input) });
}

export function useJoinWatchRoom() {
  return useMutation({ mutationFn: ({ code, input }: { code: string; input: { nickname: string } }) => communityApi.joinWatchRoom(code, input) });
}
