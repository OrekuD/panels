import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage";

type ReadingNow = {
  comicIds: Array<string>;
  updateReadingNow: (comicId: string) => void;
  reset: () => void;
};

const useReadingNow = create(
  persist<ReadingNow>(
    (set) => ({
      comicIds: [],
      reset: () => set({ comicIds: [] }),
      updateReadingNow: (comicId) => {
        set((state) => {
          const index = state.comicIds.indexOf(comicId);
          if (index === -1) {
            return { comicIds: [comicId, ...state.comicIds] };
          } else {
            return {
              comicIds: [
                comicId,
                ...state.comicIds.filter((id) => id !== comicId),
              ],
            };
          }
        });
      },
    }),
    {
      name: "reading-now-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export default useReadingNow;
