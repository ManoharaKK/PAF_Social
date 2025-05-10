import axiosInstance from "./axios-config";

const API_URL = "/api/auth/";

class AuthService {
  login(username, password) {
    console.log(`Attempting login for user: ${username}`);
    return axiosInstance
      .post(API_URL + "signin", {
        username,
        password
      })
      .then(response => {
        console.log("Login response:", response.data);
        if (response.data && response.data.token) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      })
      .catch(error => {
        console.error("Login error:", error);
        throw error;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password, fullName) {
    console.log(`Attempting registration for user: ${username}`);
    return axiosInstance
      .post(API_URL + "signup", {
        username,
        email,
        password,
        fullName
      })
      .then(response => {
        console.log("Registration response:", response.data);
        return response.data;
      })
      .catch(error => {
        console.error("Registration error:", error);
        throw error;
      });
  }

  getCurrentUser() {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        return JSON.parse(user);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        return null;
      }
    }
    return null;
  }
}

export default new AuthService(); 