import { getApiUrl } from '@/config';

export interface UserData {
  id: string;
  email: string;
  [key: string]: any;
}

export interface ModelConfig {
  model_name: string;
  sub_model_name: string;
  api_key: string;
  project_id: string;
}

export const fetchUserData = async (getToken: () => string | null, userId: string): Promise<UserData> => {
  const token = getToken();
  if (!token) {
    throw new Error('No access token found. Please log in.');
  }
  if (!userId) {
    throw new Error('No user ID provided');
  }

  const response = await fetch(getApiUrl(`bot/user/${userId}`), {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch user data');
  }

  return response.json();
};

export interface UploadPdfResponse {
  success: boolean;
  message: string;
  file_paths?: string[];
  [key: string]: any;
}

export const uploadPdfs = async (
  projectName: string,
  files: File[],
  getToken: () => string | null
): Promise<UploadPdfResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error('No access token found. Please log in.');
  }

  const formData = new FormData();
  formData.append('projectname', projectName);
  
  // Add each file to the form data
  files.forEach((file, index) => {
    formData.append('pdf_files', file);
  });

  const response = await fetch(getApiUrl('upload_pdfs/'), {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload PDFs');
  }

  return response.json();
};

export const saveModelConfig = async (
  config: Omit<ModelConfig, 'project_id'>,
  projectId: string,
  getToken: () => string | null
): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error('No access token found. Please log in.');
  }

  const response = await fetch(getApiUrl('model-config/'), {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...config,
      project_id: projectId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to save model configuration');
  }

  return response.json();
};
