import { defineStore } from "pinia";
import axios from "axios";
import { useToast } from "vue-toast-notification";
import { mode, baseUrl, apiPrefix } from "../../config/url";

const toast = useToast();

export const useAuthStore = defineStore({
  id: "authStore",
  state: () => ({}),
  getters: {},
  actions: {
    async login(input) {
      try {
        const res = await axios({
          method: "post",
          url: `${baseUrl[mode]}${apiPrefix}/auth/login`,
          data: input,
        });

        return res;
      } catch (error) {
        // Check if the error is an axios error
        if (error.response) {
          console.error(error.response.data);
          toast.error(`${error.response.data.message}`, {
            position: "top-right",
            duration: 3000,
            queue: true,
          });
        } else {
          console.log(error);
          toast.error(`Something went wrong`, {
            position: "top-right",
            duration: 3000,
            queue: true,
          });
        }
      }
    },
    async changePassword(input) {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const res = await axios({
          method: "patch",
          url: `${baseUrl[mode]}${apiPrefix}/auth/password`,
          data: input,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return res;
      } catch (error) {
        // Check if the error is an axios error
        if (error.response) {
          console.error(error.response.data);
          toast.error(`${error.response.data.message}`, {
            position: "top-right",
            duration: 3000,
            queue: true,
          });
        } else {
          console.log(error);
          toast.error(`Something went wrong`, {
            position: "top-right",
            duration: 3000,
            queue: true,
          });
        }
      }
    },
  },
});
