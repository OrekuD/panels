import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage";
import { Comic } from "../types";

type LibraryStore = {
  comics: Array<Comic>;
  addComic: (comic: Comic) => void;
  updateCurrentPage: (comicId: string, page: number) => void;
  renameComic: (comicId: string, title: string) => void;
  deleteComic: (comicId: string) => void;
  markAsComplete: (comicId: string) => void;
  markAsUnread: (comicId: string) => void;
  reset: () => void;
};

const useLibraryStore = create(
  persist<LibraryStore>(
    (set) => ({
      comics: [],
      addComic: (comic: Comic) =>
        set((state) => ({ comics: [comic, ...state.comics] })),
      reset: () => set({ comics: [] }),
      deleteComic: (comicId) =>
        set((state) => ({
          comics: state.comics.filter((comic) => comic.id !== comicId),
        })),
      markAsComplete: (comicId) => {
        set((state) => {
          const comicIndex = state.comics.findIndex(
            (comic) => comic.id === comicId
          );
          if (comicIndex === -1) return state;

          const comic = state.comics[comicIndex];
          const updatedComic: Comic = {
            ...comic,
            currentPage: comic.pages.length,
          };

          return {
            comics: [
              ...state.comics.slice(0, comicIndex),
              updatedComic,
              ...state.comics.slice(comicIndex + 1),
            ],
          };
        });
      },
      markAsUnread: (comicId) => {
        set((state) => {
          const comicIndex = state.comics.findIndex(
            (comic) => comic.id === comicId
          );
          if (comicIndex === -1) return state;

          const comic = state.comics[comicIndex];
          const updatedComic: Comic = {
            ...comic,
            currentPage: 0,
          };

          return {
            comics: [
              ...state.comics.slice(0, comicIndex),
              updatedComic,
              ...state.comics.slice(comicIndex + 1),
            ],
          };
        });
      },
      renameComic: (comicId, title) => {
        set((state) => {
          const comicIndex = state.comics.findIndex(
            (comic) => comic.id === comicId
          );
          if (comicIndex === -1) return state;

          const comic = state.comics[comicIndex];
          const updatedComic = {
            ...comic,
            title,
          };

          return {
            comics: [
              ...state.comics.slice(0, comicIndex),
              updatedComic,
              ...state.comics.slice(comicIndex + 1),
            ],
          };
        });
      },
      updateCurrentPage: (comicId, page) =>
        set((state) => {
          const comicIndex = state.comics.findIndex(
            (comic) => comic.id === comicId
          );
          if (comicIndex === -1) return state;

          const comic = state.comics[comicIndex];
          const updatedComic = {
            ...comic,
            currentPage: page,
          };

          return {
            comics: [
              ...state.comics.slice(0, comicIndex),
              updatedComic,
              ...state.comics.slice(comicIndex + 1),
            ],
          };
        }),
    }),
    {
      name: "library-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export default useLibraryStore;
