import axios from "axios";

import { toApiError } from "../../../core/api/apiError";
import type { Club, CreateClubInput, Member, PaginatedClubs, User } from "../types/Club";
import type { CreateWatchRoomInput, JoinWatchRoomInput, JoinWatchRoomResult, PlaybackState, PlaybackUpdate, WatchRoom, WatchRoomCreated } from "../types/WatchRoom";

const communityClient = axios.create({
  baseURL: import.meta.env.VITE_COMMUNITY_API_URL || "https://tv9kgos66m.execute-api.us-east-1.amazonaws.com",
  headers: { "Content-Type": "application/json" },
});

communityClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("astra.accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrapResponse<T>(value: T | { data?: T; result?: T }): T {
  const response = value as { data?: T; result?: T };
  return response.data ?? response.result ?? value as T;
}

export const communityApi = {
  async listClubs(page: number = 1, search: string = ""): Promise<PaginatedClubs> {
    try {
      const params = new URLSearchParams({ page: page.toString(), size: "20" });
      if (search) params.append("search", search);
      const response = await communityClient.get<PaginatedClubs>(`/api/v1/clubs?${params.toString()}`);
      return unwrapResponse(response.data);
    } catch (error) { throw toApiError(error, "Community Service"); }
  },
  async createClub(input: CreateClubInput): Promise<Club> {
    try { const response = await communityClient.post<Club>("/api/v1/clubs", input); return unwrapResponse(response.data); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async joinClub(clubId: number): Promise<void> {
    try { await communityClient.post(`/api/v1/clubs/${encodeURIComponent(clubId)}/members`); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async getClub(clubId: number): Promise<Club> {
    try { const response = await communityClient.get<Club>(`/api/v1/clubs/${encodeURIComponent(clubId)}`); return unwrapResponse(response.data); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async getClubMembers(clubId: number): Promise<Member[]> {
    try { const response = await communityClient.get<Member[]>(`/api/v1/clubs/${encodeURIComponent(clubId)}/members`); return unwrapResponse(response.data); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async getUserMemberships(userId: number): Promise<Member[]> {
    try { const response = await communityClient.get<Member[]>(`/api/v1/users/${encodeURIComponent(userId)}/clubs`); return unwrapResponse(response.data); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async getUsers(limit: number = 100): Promise<User[]> {
    try { const response = await communityClient.get<User[]>(`/api/v1/users?limit=${limit}`); return unwrapResponse(response.data); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async getUser(userId: number): Promise<User> {
    try { const response = await communityClient.get<User>(`/api/v1/users/${encodeURIComponent(userId)}`); return unwrapResponse(response.data); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async leaveClub(clubId: number, userId: number): Promise<void> {
    try { await communityClient.delete(`/api/v1/clubs/${encodeURIComponent(clubId)}/members/${userId}`); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async createWatchRoom(input: CreateWatchRoomInput): Promise<WatchRoomCreated> {
    try { const response = await communityClient.post<WatchRoomCreated>("/api/v1/watch-rooms", input); return unwrapResponse(response.data); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async getWatchRoom(code: string): Promise<WatchRoom> {
    try { const response = await communityClient.get<WatchRoom>(`/api/v1/watch-rooms/${encodeURIComponent(code)}`); return unwrapResponse(response.data); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async joinWatchRoom(code: string, input: JoinWatchRoomInput): Promise<JoinWatchRoomResult> {
    try { const response = await communityClient.post<JoinWatchRoomResult>(`/api/v1/watch-rooms/${encodeURIComponent(code)}/join`, input); return unwrapResponse(response.data); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async removeParticipant(code: string, userId: number): Promise<void> {
    try { await communityClient.delete(`/api/v1/watch-rooms/${encodeURIComponent(code)}/participants/${userId}`); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
  async updatePlayback(roomId: string, input: PlaybackUpdate): Promise<PlaybackState> {
    try { const response = await communityClient.patch<PlaybackState>(`/api/v1/watch-rooms/${encodeURIComponent(roomId)}/playback`, input); return unwrapResponse(response.data); }
    catch (error) { throw toApiError(error, "Community Service"); }
  },
};
