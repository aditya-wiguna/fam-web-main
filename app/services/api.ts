import { fetchAuthSession } from "@aws-amplify/auth";

// API wrapper using Amplify auth tokens
const API_BASE_URL = "https://api.finexisam.com";

async function getAuthToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    return idToken || null;
  } catch (e) {
    console.log("No auth session available");
    return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = token;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`) as Error & { response?: { status: number } };
    error.response = { status: response.status };
    throw error;
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

export default api;
