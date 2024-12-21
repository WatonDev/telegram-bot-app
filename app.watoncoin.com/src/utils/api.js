import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Rejestracja użytkownika w systemie.
 */
export const registerUser = async (initData) => {
  try {
    const response = await apiClient.post(`/api/register`, { initData });
    localStorage.setItem("jwt", response.data.token);
    return response.data.user;
  } catch (error) {
    console.error("Error registering user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Pobieranie punktów użytkownika.
 */
export const fetchUserPoints = async () => {
  try {
    const token = localStorage.getItem("jwtToken");
    console.log("Token used in fetchUserPoints:", token); // Log tokena
    const response = await axios.get("/users/points", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetched points:", response.data.points); // Log punktów
    return response.data.points; // Zwrot punktów
  } catch (error) {
    console.error("Error fetching user points:", error.response?.data || error.message);
    return 0; // Zwrot domyślnych punktów (0)
  }
};

/**
 * Aktualizacja statusu powitalnego.
 */
export const markWelcomeSeen = async () => {
  try {
    const response = await apiClient.post("/api/seen-welcome");
    return response.data;
  } catch (error) {
    console.error("Error marking welcome as seen:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchFriends = async (telegramId) => {
  if (!telegramId) {
    throw new Error("Telegram ID is required to fetch friends.");
  }

  try {
    const response = await axios.get(`${BASE_URL}/friends`, {
      params: { telegramId },
    });
    return response.data.friends;
  } catch (error) {
    console.error("Error fetching friends:", error.response?.data || error.message);
    throw error;
  }
};

export const generateReflink = (telegramId) => {
  if (!telegramId) {
    throw new Error("Telegram ID is required to generate a referral link.");
  }
  return `https://t.me/watonapp_bot?start=ref_${telegramId}`;
};

export const fetchLeaderboard = async (telegramId) => {
  try {
    const token = localStorage.getItem("jwtToken");
	console.log("Token used in fetchUserPoints:", token); // Dodaj log
    const response = await axios.get("/api/leaderboard", {
      params: { telegramId },
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetched leaderboard data:", response.data);
    return response.data; // Zwrot danych leaderboard
  } catch (error) {
    console.error("Error fetching leaderboard:", error.response?.data || error.message);
    throw error; // Wyrzucenie błędu
  }
};
