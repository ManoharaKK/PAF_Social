import axios from "./axios-config";

const API_URL = "/api/test/";

class UserService {
  getPublicContent() {
    return axios.get(API_URL + "public");
  }
}

export default new UserService(); 