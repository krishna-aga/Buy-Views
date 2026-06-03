const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

export const getStoredSession = () => {
  try {
    const token = localStorage.getItem("buyViewsToken");
    const user = JSON.parse(localStorage.getItem("buyViewsUser") || "null");
    return token && user ? { token, user } : null;
  } catch {
    return null;
  }
};

export const storeSession = ({ token, user }) => {
  localStorage.setItem("buyViewsToken", token);
  localStorage.setItem("buyViewsUser", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("buyViewsToken");
  localStorage.removeItem("buyViewsUser");
};

export const apiRequest = (path, { token, method = "GET", body } = {}) =>
  fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(parseResponse);

export const youtubeConnectUrl = (token) =>
  `${API_BASE_URL}/youtube/connect?token=${encodeURIComponent(token)}`;
