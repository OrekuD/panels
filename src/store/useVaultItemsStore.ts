import { create } from "zustand";
import uuid from "../utils/uuid";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage";
import { VaultFile, VaultFolder } from "../types";

type VaultItemsStore = {
  folders: VaultFolder[];
  files: VaultFile[];
  // Folder operations
  addFolder: (folder: VaultFolder) => void;
  renameFolder: (folderId: string, newName: string) => void;
  deleteFolder: (folderId: string) => void;
  // File operations
  addFile: (file: VaultFile) => void;
  addFilesToFolder: (folderId: string, fileIds: string[]) => void;
  removeFileFromFolder: (folderId: string, fileId: string) => void;
  deleteFile: (fileId: string) => void;
  // Import operations
  importFolderStructure: (
    parentFolderId: string | null,
    folderStructure: {
      folder: VaultFolder;
      files: VaultFile[];
      subFolders: any[]; // Recursive structure
    }
  ) => void;
  // Utility operations
  moveItem: (
    itemId: string,
    itemType: "file" | "folder",
    targetFolderId: string | null
  ) => void;
  reset: () => void;
  createFolder: (name: string, parentId: string | null) => void;
};

const useVaultItemsStore = create(
  persist<VaultItemsStore>(
    (set, get) => ({
      folders: [],
      files: [],

      reset: () => {
        set({ folders: [], files: [] });
      },

      // Folder operations
      addFolder: (folder) =>
        set((state) => ({
          folders: [folder, ...state.folders],
          // If the folder has a parent, update the parent's childrenIds
          files: state.files,
        })),
      createFolder: (name, parentId = null) => {
        const newFolderId = uuid();

        const newFolder: VaultFolder = {
          id: newFolderId,
          name,
          createdAt: new Date().toISOString(),
          parentId,
          childrenIds: {
            files: [],
            folders: [],
          },
        };

        set((state) => {
          let updatedFolders = [newFolder, ...state.folders];

          // If the folder has a parent, update the parent's childrenIds
          if (parentId) {
            updatedFolders = updatedFolders.map((folder) => {
              if (folder.id === parentId) {
                return {
                  ...folder,
                  childrenIds: {
                    ...folder.childrenIds,
                    folders: [...folder.childrenIds.folders, newFolderId],
                  },
                };
              }
              return folder;
            });
          }

          return {
            folders: updatedFolders,
            files: state.files,
          };
        });
      },
      renameFolder: (folderId, newName) => {
        set((state) => {
          const folderIndex = state.folders.findIndex(
            (folder) => folder.id === folderId
          );
          if (folderIndex === -1) return state;

          const folder = state.folders[folderIndex];
          const updatedFolder = {
            ...folder,
            name: newName,
          };

          return {
            folders: [
              ...state.folders.slice(0, folderIndex),
              updatedFolder,
              ...state.folders.slice(folderIndex + 1),
            ],
            files: state.files,
          };
        });
      },

      deleteFolder: (folderId) => {
        set((state) => {
          // Find the folder to delete
          const folderToDelete = state.folders.find((f) => f.id === folderId);
          if (!folderToDelete) return state;

          // Function to collect all descendant folder IDs (recursive)
          const collectDescendantFolderIds = (parentId: string): string[] => {
            const directChildren = state.folders
              .filter((f) => f.parentId === parentId)
              .map((f) => f.id);

            const allDescendants = [...directChildren];
            directChildren.forEach((childId) => {
              allDescendants.push(...collectDescendantFolderIds(childId));
            });

            return allDescendants;
          };

          // Get all folder IDs to delete (including descendants)
          const folderIdsToDelete = [
            folderId,
            ...collectDescendantFolderIds(folderId),
          ];

          // Get all file IDs to delete (files in this folder and descendant folders)
          const fileIdsToDelete = state.files
            .filter((file) => folderIdsToDelete.includes(file.parentId || ""))
            .map((file) => file.id);

          // Update parent folder's childrenIds if this folder has a parent
          let updatedFolders = state.folders.filter(
            (folder) => !folderIdsToDelete.includes(folder.id)
          );

          if (folderToDelete.parentId) {
            updatedFolders = updatedFolders.map((folder) => {
              if (folder.id === folderToDelete.parentId) {
                return {
                  ...folder,
                  childrenIds: {
                    ...folder.childrenIds,
                    folders: folder.childrenIds.folders.filter(
                      (id) => id !== folderId
                    ),
                  },
                };
              }
              return folder;
            });
          }

          return {
            folders: updatedFolders,
            files: state.files.filter(
              (file) => !fileIdsToDelete.includes(file.id)
            ),
          };
        });
      },

      // File operations
      addFile: (file) =>
        set((state) => {
          let updatedFolders = [...state.folders];

          // If the file has a parent folder, update the parent folder's childrenIds
          if (file.parentId) {
            updatedFolders = updatedFolders.map((folder) => {
              if (folder.id === file.parentId) {
                return {
                  ...folder,
                  childrenIds: {
                    ...folder.childrenIds,
                    files: [...folder.childrenIds.files, file.id],
                  },
                };
              }
              return folder;
            });
          }

          return {
            folders: updatedFolders,
            files: [file, ...state.files],
          };
        }),

      addFilesToFolder: (folderId, fileIds) =>
        set((state) => {
          // Find the folder
          const folderIndex = state.folders.findIndex(
            (folder) => folder.id === folderId
          );
          if (folderIndex === -1) return state;

          const folder = state.folders[folderIndex];

          // Update the folder's childrenIds
          const updatedFolder = {
            ...folder,
            childrenIds: {
              ...folder.childrenIds,
              files: [...folder.childrenIds.files, ...fileIds],
            },
          };

          // Update the files' parentId
          const updatedFiles = state.files.map((file) => {
            if (fileIds.includes(file.id)) {
              return {
                ...file,
                parentId: folderId,
              };
            }
            return file;
          });

          return {
            folders: [
              ...state.folders.slice(0, folderIndex),
              updatedFolder,
              ...state.folders.slice(folderIndex + 1),
            ],
            files: updatedFiles,
          };
        }),

      removeFileFromFolder: (folderId, fileId) =>
        set((state) => {
          // Find the folder
          const folderIndex = state.folders.findIndex(
            (folder) => folder.id === folderId
          );
          if (folderIndex === -1) return state;

          const folder = state.folders[folderIndex];

          // Update the folder's childrenIds
          const updatedFolder = {
            ...folder,
            childrenIds: {
              ...folder.childrenIds,
              files: folder.childrenIds.files.filter((id) => id !== fileId),
            },
          };

          // Update the file's parentId to null
          const updatedFiles = state.files.map((file) => {
            if (file.id === fileId && file.parentId === folderId) {
              return {
                ...file,
                parentId: null,
              };
            }
            return file;
          });

          return {
            folders: [
              ...state.folders.slice(0, folderIndex),
              updatedFolder,
              ...state.folders.slice(folderIndex + 1),
            ],
            files: updatedFiles,
          };
        }),

      deleteFile: (fileId) =>
        set((state) => {
          // Find the file to get its parentId
          const fileToDelete = state.files.find((file) => file.id === fileId);

          let updatedFolders = [...state.folders];

          // If the file has a parent, update the parent folder
          if (fileToDelete && fileToDelete.parentId) {
            updatedFolders = updatedFolders.map((folder) => {
              if (folder.id === fileToDelete.parentId) {
                return {
                  ...folder,
                  childrenIds: {
                    ...folder.childrenIds,
                    files: folder.childrenIds.files.filter(
                      (id) => id !== fileId
                    ),
                  },
                };
              }
              return folder;
            });
          }

          return {
            folders: updatedFolders,
            files: state.files.filter((file) => file.id !== fileId),
          };
        }),

      // Import operations
      importFolderStructure: (parentFolderId, folderStructure) =>
        set((state) => {
          const importRecursively = (
            structure: any,
            currentParentId: string | null,
            foldersList: VaultFolder[],
            filesList: VaultFile[]
          ) => {
            // Add the current folder
            const currentFolder = {
              ...structure.folder,
              parentId: currentParentId,
            };
            foldersList.push(currentFolder);

            // Add all files in this folder
            const filesWithParentId = structure.files.map(
              (file: VaultFile) => ({
                ...file,
                parentId: currentFolder.id,
              })
            );
            filesList.push(...filesWithParentId);

            // Update the folder's childrenIds
            const folderIndex = foldersList.findIndex(
              (f) => f.id === currentFolder.id
            );
            if (folderIndex !== -1) {
              foldersList[folderIndex].childrenIds = {
                files: filesWithParentId.map((f: any) => f.id),
                folders: structure.subFolders.map((sf: any) => sf.folder.id),
              };
            }

            // Process subfolders recursively
            structure.subFolders.forEach((subFolder: any) => {
              importRecursively(
                subFolder,
                currentFolder.id,
                foldersList,
                filesList
              );
            });

            return { foldersList, filesList };
          };

          // Start the recursive import
          const { foldersList, filesList } = importRecursively(
            folderStructure,
            parentFolderId,
            [...state.folders],
            [...state.files]
          );

          // If there's a parent folder, update its childrenIds
          let updatedFolders = foldersList;
          if (parentFolderId) {
            updatedFolders = updatedFolders.map((folder) => {
              if (folder.id === parentFolderId) {
                return {
                  ...folder,
                  childrenIds: {
                    ...folder.childrenIds,
                    folders: [
                      ...folder.childrenIds.folders,
                      folderStructure.folder.id,
                    ],
                  },
                };
              }
              return folder;
            });
          }

          return {
            folders: updatedFolders,
            files: filesList,
          };
        }),

      // Utility operations
      moveItem: (itemId, itemType, targetFolderId) =>
        set((state) => {
          if (itemType === "file") {
            // Find the file
            const fileToMove = state.files.find((file) => file.id === itemId);
            if (!fileToMove) return state;

            let updatedFolders = [...state.folders];

            // Remove from current parent folder
            if (fileToMove.parentId) {
              updatedFolders = updatedFolders.map((folder) => {
                if (folder.id === fileToMove.parentId) {
                  return {
                    ...folder,
                    childrenIds: {
                      ...folder.childrenIds,
                      files: folder.childrenIds.files.filter(
                        (id) => id !== itemId
                      ),
                    },
                  };
                }
                return folder;
              });
            }

            // Add to new parent folder
            if (targetFolderId) {
              updatedFolders = updatedFolders.map((folder) => {
                if (folder.id === targetFolderId) {
                  return {
                    ...folder,
                    childrenIds: {
                      ...folder.childrenIds,
                      files: [...folder.childrenIds.files, itemId],
                    },
                  };
                }
                return folder;
              });
            }

            // Update the file's parentId
            const updatedFiles = state.files.map((file) => {
              if (file.id === itemId) {
                return {
                  ...file,
                  parentId: targetFolderId,
                };
              }
              return file;
            });

            return {
              folders: updatedFolders,
              files: updatedFiles,
            };
          } else {
            // Find the folder
            const folderToMove = state.folders.find(
              (folder) => folder.id === itemId
            );
            if (!folderToMove) return state;

            // Prevent moving a folder into itself or its descendants
            if (targetFolderId === itemId) return state;

            // Check if target is a descendant of the folder being moved
            const isDescendant = (
              potentialParentId: string,
              potentialChildId: string
            ): boolean => {
              const potentialParent = state.folders.find(
                (f) => f.id === potentialParentId
              );
              if (!potentialParent) return false;

              if (
                potentialParent.childrenIds.folders.includes(potentialChildId)
              )
                return true;

              return potentialParent.childrenIds.folders.some((childId) =>
                isDescendant(childId, potentialChildId)
              );
            };

            if (targetFolderId && isDescendant(itemId, targetFolderId))
              return state;

            let updatedFolders = [...state.folders];

            // Remove from current parent folder
            if (folderToMove.parentId) {
              updatedFolders = updatedFolders.map((folder) => {
                if (folder.id === folderToMove.parentId) {
                  return {
                    ...folder,
                    childrenIds: {
                      ...folder.childrenIds,
                      folders: folder.childrenIds.folders.filter(
                        (id) => id !== itemId
                      ),
                    },
                  };
                }
                return folder;
              });
            }

            // Add to new parent folder
            if (targetFolderId) {
              updatedFolders = updatedFolders.map((folder) => {
                if (folder.id === targetFolderId) {
                  return {
                    ...folder,
                    childrenIds: {
                      ...folder.childrenIds,
                      folders: [...folder.childrenIds.folders, itemId],
                    },
                  };
                }
                return folder;
              });
            }

            // Update the folder's parentId
            updatedFolders = updatedFolders.map((folder) => {
              if (folder.id === itemId) {
                return {
                  ...folder,
                  parentId: targetFolderId,
                };
              }
              return folder;
            });

            return {
              folders: updatedFolders,
              files: state.files,
            };
          }
        }),
    }),
    {
      name: "vault-items-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export default useVaultItemsStore;
