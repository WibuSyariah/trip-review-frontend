import { defineStore } from "pinia";
import axios from "axios";
import { useToast } from "vue-toast-notification";
import { mode, baseUrl, apiPrefix } from "../../config/url";

const toast = useToast();

export const useTripStore = defineStore({
  id: "tripStore",
  state: () => ({
    trip: {},
    trips: [],
    dropdown: {
      drivers: [],
      cars: [],
      divisions: [],
      emoneys: [],
    },
    query: {
      limit: 10,
      currentPage: 1,
      totalPages: 1,
    },
    defaultQuery: {
      limit: 10,
      currentPage: 1,
      totalPages: 1,
    },
  }),
  getters: {},
  actions: {
    async fetchTrip(params) {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const res = await axios({
          method: "get",
          url: `${baseUrl[mode]}${apiPrefix}/trip`,
          params: params ? params : {},
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        this.query.totalPages = res.data.data.totalPages;
        this.query.currentPage = res.data.data.currentPage;
        this.trips = res.data.data.trips;

        console.log(this.trips);
      } catch (error) {
        console.error(error);
        toast.error(`Something went wrong`, {
          position: "bottom-right",
          duration: 3000,
          queue: true,
        });
      }
    },
    async fetchTripDetail(tripId) {
      try {
        const res = await axios({
          method: "get",
          url: `${baseUrl[mode]}${apiPrefix}/trip/${tripId}`,
        });

        console.log(res.data, "ini data")

        this.trip = res.data.data.trip;
      } catch (error) {
        // Check if the error is an axios error
        if (error.response) {
          console.error(error.response.data);
          toast.error(`${error.response.data.message}`, {
            position: "bottom-right",
            duration: 3000,
            queue: true,
          });
        } else {
          console.log(error);
          toast.error(`Something went wrong`, {
            position: "bottom-right",
            duration: 3000,
            queue: true,
          });
        }
      }
    },

    async fetchTripDropdown() {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const res = await axios({
          method: "get",
          url: `${baseUrl[mode]}${apiPrefix}/dropdown/trip-form`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Ensure the API response is mapped to `text` and `value` for all dropdowns
        this.dropdown.drivers = res.data.data.drivers.map((driver) => ({
          title: driver.name, // Mapping driver name to `title`
          value: driver.id, // Mapping driver ID to `value`
        }));
        this.dropdown.cars = res.data.data.cars.map((car) => ({
          title: car.name, // Mapping car name to `title`
          value: car.id, // Mapping car ID to `value`
        }));
        this.dropdown.divisions = res.data.data.divisions.map((division) => ({
          title: division.name, // Mapping division name to `title`
          value: division.id, // Mapping division ID to `value`
        }));
        this.dropdown.emoneys = res.data.data.emoneys.map((emoney) => ({
          title: emoney.name, // Mapping emoney name to `title`
          value: emoney.id, // Mapping emoney ID to `value`
        }));

        console.log(this.dropdown.drivers, "ini cuy");
      } catch (error) {
        console.error(error);
        toast.error(`Something went wrong`, {
          position: "bottom-right",
          duration: 3000,
          queue: true,
        });
      }
    },
    async createTrip(input) {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const res = await axios({
          method: "post",
          url: `${baseUrl[mode]}${apiPrefix}/trip`,
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
            position: "bottom-right",
            duration: 3000,
            queue: true,
          });
        } else {
          console.log(error);
          toast.error(`Something went wrong`, {
            position: "bottom-right",
            duration: 3000,
            queue: true,
          });
        }
      }
    },
    async deleteTrip(tripId) {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const res = await axios({
          method: "delete",
          url: `${baseUrl[mode]}${apiPrefix}/trip/${tripId}`,
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
            position: "bottom-right",
            duration: 3000,
            queue: true,
          });
        } else {
          console.log(error);
          toast.error(`Something went wrong`, {
            position: "bottom-right",
            duration: 3000,
            queue: true,
          });
        }
      }
    },
    async editTrip(tripId, input) {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const res = await axios({
          method: "patch",
          url: `${baseUrl}${apiPrefix}/trip/${tripId}`,
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
            position: "bottom-right",
            duration: 3000,
            queue: true,
          });
        } else {
          console.log(error);
          toast.error(`Something went wrong`, {
            position: "bottom-right",
            duration: 3000,
            queue: true,
          });
        }
      }
    },
  },
});
