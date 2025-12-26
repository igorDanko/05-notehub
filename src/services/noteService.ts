import axios from "axios";
import type { Note, NoteTag } from "../types/note";

const API_URL = "https://notehub-public.goit.study/api/notes";
const TOKEN = import.meta.env.VITE_NOTEHUB_TOKEN;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
  page: number;
  perPage: number;
  totalNotes: number;
}

export interface CreateNoteData {
  title: string;
  content?: string;
  tag: NoteTag;
}

export const fetchNotes = async (
  params: FetchNotesParams = {}
): Promise<FetchNotesResponse> => {
  const { page = 1, perPage = 12, search } = params;

  const queryParams: Record<string, string | number> = {
    page,
    perPage,
  };

  if (search && search.trim()) {
    queryParams.search = search.trim();
  }

  const response = await axiosInstance.get<FetchNotesResponse>("", {
    params: queryParams,
  });

  return response.data;
};

export const createNote = async (noteData: CreateNoteData): Promise<Note> => {
  const response = await axiosInstance.post<Note>("", noteData);
  return response.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response = await axiosInstance.delete<Note>(`/${id}`);
  return response.data;
};

