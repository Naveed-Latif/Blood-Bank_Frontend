import axios from "axios";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const getToken = () => localStorage.getItem("Token");

export const getDonors = async () => {
  const response = await axios.get(`${backendUrl}/users`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

export const getDonorsByBloodGroup = async (bloodGroup: string) => {
  const response = await axios.get(
    `${backendUrl}/users/blood-group/${bloodGroup}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    },
  );
  return response.data;
};

export const getDonorById = async (id: string) => {
  const response = await axios.get(`${backendUrl}/users/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

export const searchDonors = async (bloodType?: string) => {
  if (bloodType) {
    return getDonorsByBloodGroup(bloodType);
  }
  return getDonors();
};
