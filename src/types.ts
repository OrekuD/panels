export type Comic = {
  id: string;
  pages: Array<string>;
  title: string;
  size: number;
  createdAt: string;
  currentPage: number;
};

export type ComicCollection = {
  id: string;
  name: string;
  comics: Array<string>;
  createdAt: string;
};

export type VaultFile = {
  id: string;
  name: string;
  type: "image" | "video"; // Updated type to be specific
  size: number;
  uri: string;
  thumbnail: string;
  createdAt: string;
  parentId: string | null; // null if at root level
};

export type VaultFolder = {
  id: string;
  name: string;
  createdAt: string;
  parentId: string | null; // null if at root level
  childrenIds: {
    files: string[];
    folders: string[];
  };
};

export type VaultItem = VaultFolder;
