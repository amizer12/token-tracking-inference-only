const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public error: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data.error || 'Unknown error'
    );
  }

  return data;
}

export async function createUser(
  userId: string,
  tokenLimit: number
): Promise<any> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const response = await fetchWithRetry(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, tokenLimit })
  });

  return handleResponse(response);
}

export async function getUserUsage(userId: string): Promise<any> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const response = await fetchWithRetry(`${API_BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers
  });

  return handleResponse(response);
}

export async function updateTokenLimit(
  userId: string,
  newLimit: number
): Promise<any> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const response = await fetchWithRetry(
    `${API_BASE_URL}/users/${userId}/limit`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify({ newLimit })
    }
  );

  return handleResponse(response);
}

export async function listAllUsers(): Promise<any> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const response = await fetchWithRetry(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers
  });

  return handleResponse(response);
}

export async function invokeModel(
  userId: string,
  prompt: string
): Promise<any> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const response = await fetchWithRetry(
    `${API_BASE_URL}/invoke/${userId}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt })
    }
  );

  return handleResponse(response);
}

export async function deleteUser(userId: string): Promise<any> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const response = await fetchWithRetry(
    `${API_BASE_URL}/users/${userId}`,
    {
      method: 'DELETE',
      headers
    }
  );

  return handleResponse(response);
}
