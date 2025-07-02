import axios from "axios";
import { loginDataStore } from "@/store/login_data";
import { apiErrorStore } from "@/store/api_error";
import router from "../router/routes";

const apiError = apiErrorStore();
const loginData = loginDataStore();

export default {
  async request(method, url, data, params) {
    let config = {
      method: method,
      url: url,
    };
    if (data) {
      config.data = data;
    }
    if (params) {
      config.params = params;
    }
    let result;
    await axios(config)
      .then((response) => {
        // loginData.setTimestamp();
        result = response.data;
      })
      .catch((error) => {
        if (error.response.status === 401) {
          router.push({ name: "LoginError" });
        } else {
          apiError.set(error);
        }
      });
    return result;
  },
  async delete(url) {
    return await this.request("delete", url);
  },
  async get(url, params) {
    let data;
    return await this.request("get", url, data, params);
  },
  async post(url, data, params) {
    return await this.request("post", url, data, params);
  },
  async put(url, data, params) {
    return await this.request("put", url, data, params);
  },
};
