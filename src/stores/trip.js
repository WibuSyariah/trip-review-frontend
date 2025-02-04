import { defineStore } from "pinia";
import axios from "axios";
import { useToast } from "vue-toast-notification";
import { mode, baseUrlApi, apiPrefix } from "../../config/url";
import dayjs from "dayjs";

const toast = useToast();

export const useTripStore = defineStore({
  id: "tripStore",
  state: () => ({
    trips: [],
    tripCount: 0,
    avgRating: 0,
    dropdown: {
      drivers: [],
      cars: [],
      companies: [],
      divisions: [],
      eMoneys: [],
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
          url: `${baseUrlApi[mode]}${apiPrefix}/trip`,
          params: params ? params : {},
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        this.query.totalPages = res.data.data.totalPages;
        this.query.currentPage = res.data.data.currentPage;
        this.trips = res.data.data.trips;
        this.tripCount = res.data.data.tripCount;
        this.avgRating = res.data.data.avgRating;

        // console.log(this.trips, "masuk coy");
      } catch (error) {
        console.error(error);
        toast.error(`Something went wrong`, {
          position: "bottom-right",
          duration: 3000,
          queue: true,
        });
      }
    },
    async downloadExcel(params) {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const res = await axios({
          method: "get",
          url: `${baseUrlApi[mode]}${apiPrefix}/trip/excel`,
          params: params ? params : {},
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob", // Ensure we get the response as a Blob
        });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([res.data]));

        // Create a link element for downloading the file
        const link = document.createElement("a");
        link.href = url;

        // Format the dates for the filename
        const formattedStartDate = params.startDateTime
          ? dayjs(params.startDateTime).format("DD-MM-YYYY")
          : "start";
        const formattedEndDate = params.endDateTime
          ? dayjs(params.endDateTime).format("DD-MM-YYYY")
          : "end";

        let fileName = `Trips ${formattedStartDate} to ${formattedEndDate}.xlsx`;

        if (params.driverId) {
          const driver = this.dropdown.drivers.find(
            (driver) => driver.value === params.driverId, // Use params.driverId instead of value
          );

          if (driver) {
            // Ensure that driver exists
            const driverName = driver.title;
            fileName = `Trips ${formattedStartDate} to ${formattedEndDate} - ${driverName}.xlsx`;
          }
        }

        // Set the filename for download
        link.setAttribute("download", fileName);

        // Append to the body and trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up the URL and remove the link element
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong", {
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
          url: `${baseUrlApi[mode]}${apiPrefix}/trip/${tripId}`,
        });

        this.trip = res.data.data.trip;

        console.log(this.trip);
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
          url: `${baseUrlApi[mode]}${apiPrefix}/dropdown/trip-form`,
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
        this.dropdown.companies = res.data.data.companies.map((company) => ({
          title: company.name, // Mapping company name to `title`
          value: company.id, // Mapping company ID to `value`
        }));
        this.dropdown.divisions = res.data.data.divisions.map((division) => ({
          title: division.name, // Mapping division name to `title`
          value: division.id, // Mapping division ID to `value`
        }));
        this.dropdown.eMoneys = res.data.data.eMoneys.map((eMoney) => ({
          title: eMoney.name, // Mapping eMoney name to `title`
          value: eMoney.id, // Mapping eMoney ID to `value`
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
          url: `${baseUrlApi[mode]}${apiPrefix}/trip`,
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
          url: `${baseUrlApi[mode]}${apiPrefix}/trip/${tripId}`,
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
          url: `${baseUrlApi[mode]}${apiPrefix}/trip/${tripId}`,
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
