export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  starred: boolean;
  path?: string;
}

export interface FolderContent {
  files: FileItem[];
  path: string[];
}

export interface UploadFileResponse {
  file: FileItem;
  message: string;
}

export interface CreateFolderResponse {
  folder: FileItem;
  message: string;
}

export interface ShareUrlResponse {
  url: string;
  expiresAt: string;
}

export interface ErrorResponse {
  error: string;
}
