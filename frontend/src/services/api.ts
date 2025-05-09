import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Types
export interface FileItem {
  id: string;
  name: string;
  path: string;
  parentId: string;
  size: number;
  type: string;
  createdAt: string;
  modifiedAt: string;
  starred: boolean;
}

export interface DirectoryItem {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  starred: boolean;
}

export interface ItemsResponse {
  directories: DirectoryItem[];
  files: FileItem[];
}

// API functions
export const getItems = async (parentId: string = 'root'): Promise<ItemsResponse> => {
  const response = await axios.get(`${API_URL}/items`, { params: { parentId } });
  return response.data;
};

export const getStarredItems = async (): Promise<ItemsResponse> => {
  const response = await axios.get(`${API_URL}/starred`);
  return response.data;
};

export const createDirectory = async (name: string, parentId: string = 'root'): Promise<DirectoryItem> => {
  const response = await axios.post(`${API_URL}/directories`, { name, parentId });
  return response.data;
};

export const uploadFiles = async (files: File[], parentId: string = 'root'): Promise<FileItem[]> => {
  const formData = new FormData();
  formData.append('parentId', parentId);
  
  for (const file of files) {
    formData.append('files', file);
  }
  
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const downloadFile = (fileId: string): void => {
  window.open(`${API_URL}/download/${fileId}`, '_blank');
};

export const toggleStarItem = async (
  itemType: 'file' | 'directory',
  itemId: string,
  starred: boolean
): Promise<FileItem | DirectoryItem> => {
  const response = await axios.patch(`${API_URL}/star/${itemType}/${itemId}`, { starred });
  return response.data;
};

export const shareFile = async (fileId: string): Promise<{ shareUrl: string }> => {
  const response = await axios.post(`${API_URL}/share/${fileId}`);
  return response.data;
};

export const deleteItem = async (itemType: 'file' | 'directory', itemId: string): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/items/${itemType}/${itemId}`);
  return response.data;
};
