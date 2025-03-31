import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage";

type BookmarksStore = {
  comicIds: Array<string>;
  updateBookmarks: (comicId: string) => void;
  reset: () => void;
};

const useBookmarksStore = create(
  persist<BookmarksStore>(
    (set) => ({
      comicIds: [],
      reset: () => set({ comicIds: [] }),
      updateBookmarks: (comicId) => {
        set((state) => {
          const index = state.comicIds.indexOf(comicId);
          if (index === -1) {
            return { comicIds: [...state.comicIds, comicId] };
          } else {
            return { comicIds: state.comicIds.filter((id) => id !== comicId) };
          }
        });
      },
    }),
    {
      name: "bookmarks-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export default useBookmarksStore;
