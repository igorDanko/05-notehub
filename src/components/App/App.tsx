import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import {
  fetchNotes,
  createNote,
  deleteNote,
  type CreateNoteData,
} from "../../services/noteService";
import NoteList from "../NoteList/NoteList";
import SearchBox from "../SearchBox/SearchBox";
import Pagination from "../Pagination/Pagination";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import type { NoteFormValues } from "../NoteForm/NoteForm";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import css from "./App.module.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [debouncedSearch] = useDebounce(searchQuery, 500);

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["notes", currentPage, debouncedSearch],
    queryFn: () =>
      fetchNotes({
        page: currentPage,
        perPage: 12,
        search: debouncedSearch || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (noteData: CreateNoteData) => createNote(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateNote = (values: NoteFormValues) => {
    const noteData: CreateNoteData = {
      title: values.title,
      content: values.content || undefined,
      tag: values.tag,
    };
    createMutation.mutate(noteData);
  };

  const handleDeleteNote = (id: number) => {
    deleteMutation.mutate(id);
  };

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchQuery} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            pageCount={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
        <button className={css.button} onClick={handleOpenModal}>
          Create note +
        </button>
      </header>

      {isLoading && <Loader />}

      {isError && (
        <ErrorMessage
          message={error instanceof Error ? error.message : "An error occurred"}
        />
      )}

      {!isLoading && !isError && notes.length > 0 && (
        <NoteList notes={notes} onDelete={handleDeleteNote} />
      )}

      {!isLoading && !isError && notes.length === 0 && (
        <p>No notes found.</p>
      )}

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <NoteForm
            onSubmit={handleCreateNote}
            onCancel={handleCloseModal}
            isSubmitting={createMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}

