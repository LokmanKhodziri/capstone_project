import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "/api/auth/";

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "login", {
        username,
        password,
      })
      .then((response) => {
        if (response.data.token) {
          const decoded = jwtDecode(response.data.token);

          let primaryRole = "USER";
          const maybeRoles = decoded.roles || decoded.authorities || decoded.role || decoded.roles;
          if (Array.isArray(maybeRoles) && maybeRoles.length > 0) {
            primaryRole = String(maybeRoles[0]).replace(/^ROLE_/, "");
          } else if (typeof maybeRoles === "string" && maybeRoles) {
            primaryRole = String(maybeRoles).replace(/^ROLE_/, "");
          } else if (Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
            const a = decoded.authorities[0];
            primaryRole = String(typeof a === "string" ? a : a.authority || a.role || "").replace(/^ROLE_/, "") || "USER";
          } else if (decoded.role) {
            primaryRole = String(decoded.role).replace(/^ROLE_/, "");
          }

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...response.data,
              username: decoded.sub || response.data.username,
              role: primaryRole,
            })
          );
        }
        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
    return axios.post(API_URL + "logout");
  }

  register(username, email, password) {
    return axios.post(API_URL + "register", {
      username,
      email,
      password,
      role: "USER",
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

const authService = new AuthService();
export default authService;