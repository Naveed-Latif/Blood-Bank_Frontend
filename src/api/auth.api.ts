import axios from "axios";
import { SignupData, User } from "../types";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const getToken = () => localStorage.getItem("Token");

export const loginUser = async (username: string, password: string) => {
  console.log(username, password);
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await axios.post(`${backendUrl}/login`, formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    withCredentials: true,
  });

  localStorage.setItem("Token", response.data.access_token);
  return response.data;
};

export const signupUser = async (userData: SignupData) => {
  const response = await axios.post(`${backendUrl}/signup/`, userData);
  return response.data;
};

export const logoutUser = async () => {
  await axios.post(
    `${backendUrl}/logout`,
    {},
    {
      headers: { Authorization: `Bearer ${getToken()}` },
      withCredentials: true,
    },
  );
  localStorage.removeItem("Token");
};

export const getCurrentUser = async () => {
  const response = await axios.get(`${backendUrl}/users/me/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

export const updateCurrentUser = async (userData: Partial<User>) => {
  const response = await axios.put(`${backendUrl}/users/me/profile`, userData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};
