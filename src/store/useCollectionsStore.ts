import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage";
import { Comic, ComicCollection } from "../types";

type CollectionsStore = {
  collections: Array<ComicCollection>;
  addCollection: (collection: ComicCollection) => void;
  addComicsToCollection: (
    collectionId: string,
    comicIds: Array<string>
  ) => void;
  removeComicFromCollection: (collectionId: string, comicId: string) => void;
  removeComicFromAllCollections: (comicId: string) => void;
  deleteCollection: (collectionId: string) => void;
  renameCollection: (collectionId: string, name: string) => void;
  reset: () => void;
};

const useCollectionsStore = create(
  persist<CollectionsStore>(
    (set) => ({
      collections: [],
      reset() {
        set({ collections: [] });
      },
      addCollection: (collection) =>
        set((state) => ({ collections: [collection, ...state.collections] })),
      deleteCollection: (collectionId) => {
        set((state) => ({
          collections: state.collections.filter(
            (collection) => collection.id !== collectionId
          ),
        }));
      },
      renameCollection: (collectionId, name) => {
        set((state) => {
          const collectionIndex = state.collections.findIndex(
            (collection) => collection.id === collectionId
          );
          if (collectionIndex === -1) return state;

          const collection = state.collections[collectionIndex];
          const updatedCollection = {
            ...collection,
            name,
          };

          return {
            collections: [
              ...state.collections.slice(0, collectionIndex),
              updatedCollection,
              ...state.collections.slice(collectionIndex + 1),
            ],
          };
        });
      },
      removeComicFromAllCollections: (comicId) => {
        set((state) => ({
          collections: state.collections.map((collection) => ({
            ...collection,
            comics: collection.comics.filter((id) => id !== comicId),
          })),
        }));
      },
      removeComicFromCollection: (collectionId, comicId) => {
        set((state) => {
          const collectionIndex = state.collections.findIndex(
            (collection) => collection.id === collectionId
          );
          if (collectionIndex === -1) return state;

          const collection = state.collections[collectionIndex];
          const updatedCollection = {
            ...collection,
            comics: collection.comics.filter((id) => id !== comicId),
          };

          return {
            collections: [
              ...state.collections.slice(0, collectionIndex),
              updatedCollection,
              ...state.collections.slice(collectionIndex + 1),
            ],
          };
        });
      },
      addComicsToCollection: (collectionId, comics) =>
        set((state) => {
          const collectionIndex = state.collections.findIndex(
            (collection) => collection.id === collectionId
          );
          if (collectionIndex === -1) return state;

          const collection = state.collections[collectionIndex];
          const updatedCollection = {
            ...collection,
            comics: [...collection.comics, ...comics],
          };

          return {
            collections: [
              ...state.collections.slice(0, collectionIndex),
              updatedCollection,
              ...state.collections.slice(collectionIndex + 1),
            ],
          };
        }),
    }),
    {
      name: "collections-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export default useCollectionsStore;
