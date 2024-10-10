<script>
import { RouterLink } from "vue-router";
import { mapWritableState, mapActions } from "pinia";
import { useTripStore } from "@/stores/trip";
import dayjs from "dayjs";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import { mode, baseUrl } from "../../config/url";

export default {
  name: "TripPage",
  data() {
    return {
      showCreateModal: false,
      showDetailModal: false,
      feedback: "",
      addTripValidationSchema: yup.object({
        passenger: yup.string().required("Passenger is required"),
        destination: yup.string().required("Destination is required"),
        location: yup.string().required("Location is required"),
        purpose: yup.string().required("Purpose is required"),
        startDateTime: yup.string().required("Start Date & Time is required"),
        endDateTime: yup.string().required("End Date & Time is required"),
        driverId: yup.string().required("Driver is required"),
        carId: yup.string().required("Car is required"),
        companyId: yup.string().required("Company is required"),
        divisionId: yup.string().required("Division is required"),
        eMoneyId: yup.string().required("E-Money is required"),
      }),
      searchBarKey: 0,
      filterTripValidationSchema: yup
        .object({
          startDateTime: yup.string().required("Start Date & Time is required"),
          endDateTime: yup.string().required("End Date & Time is required"),
        })
        .test(
          "both-or-neither",
          "Both Start Date & Time and End Date & Time must be filled together",
          function (value) {
            const { startDateTime, endDateTime } = value;
            // Check that either both fields are filled or both are empty
            return (
              (!startDateTime && !endDateTime) || (startDateTime && endDateTime)
            );
          },
        ),
    };
  },
  mounted() {
    this.fetchTrip(this.query);
    this.fetchTripDropdown();
    document.addEventListener("keydown", this.escKeyHandler);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.escKeyHandler);
  },
  computed: {
    ...mapWritableState(useTripStore, [
      "trips",
      "query",
      "dropdown",
      "defaultQuery",
      "tripCount",
      "avgRating",
    ]),
  },
  components: {
    Form,
    Field,
  },
  methods: {
    ...mapActions(useTripStore, [
      "fetchTrip",
      "fetchTripDropdown",
      "createTrip",
      "downloadExcel",
    ]),

    async filterHandler(values) {
      this.query = {
        ...this.query,
        ...values,
        currentPage: 1,
      };

      await this.fetchTrip(this.query);
    },

    async clearFilterHandler() {
      this.query = {
        limit: 10,
        currentPage: 1,
        totalPages: 1,
      };

      this.reloadSearchBar();

      await this.fetchTrip(this.query);
    },

    async downloadExcelHandler(values) {
      await this.downloadExcel(values);
    },

    createModalToggle() {
      this.showCreateModal = !this.showCreateModal;
    },

    detailModalToggle(value) {
      this.feedback = value;
      this.showDetailModal = !this.showDetailModal;
    },

    formatDate(dateString) {
      return dayjs(dateString).format("HH:mm DD/MM/YYYY");
    },

    copyToClipboard(tripId) {
      navigator.clipboard
        .writeText(`${baseUrl[mode]}/trip/${tripId}/review`)
        .then(() => {
          this.$toast.success("Copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    },

    escKeyHandler(event) {
      if (event.key === "Escape") {
        this.showCreateModal = false;
        this.showDetailModal = false;
      }
    },

    async addTripHandler(values) {
      try {
        const res = await this.createTrip(values);

        if (res.status === 201) {
          // Check for successful response
          this.fetchTrip(this.defaultQuery);
          this.$toast.success(res.data.message);
          this.showCreateModal = false;
        }
      } catch (error) {
        console.error(error);
      }
    },

    reloadSearchBar() {
      this.searchBarKey += 1; // Change the key to force reloading
    },

    async nextPage() {
      this.query.currentPage++;

      await this.fetchTrip(this.query);
    },

    async backPage() {
      this.query.currentPage--;

      await this.fetchTrip(this.query);
    },
  },
};
</script>

<template>
  <div class="w-full pr-8 pl-4 py-8 flex flex-col gap-4">
    <!-- Heading and Add Trip Button -->
    <div class="flex justify-between items-center">
      <!-- Left: Trip List Title -->
      <div class="text-3xl font-bold">
        <h1>Trip List</h1>
      </div>

      <!-- Right: Add Trip Button -->
      <div class="flex gap-4">
        <v-btn
          class="material-symbols-outlined bg-blue-600 text-white w-24 text-3xl font-bold"
          @click="createModalToggle"
        >
          add
        </v-btn>
      </div>
    </div>

    <!-- Search Bar Section -->
    <div
      class="flex justify-around pb-2 pt-8 overflow-x-auto px-4 bg-gray-100 rounded shadow w-full"
      :key="searchBarKey"
    >
      <Form
        class="flex gap-4"
        :validation-schema="filterTripValidationSchema"
        @submit="filterHandler"
        v-slot="{ values }"
      >
        <div class="flex gap-4">
          <Field name="startDateTime" v-slot="{ field, meta }">
            <v-text-field
              v-bind="field"
              label="Start Date & Time"
              type="datetime-local"
              :error-messages="meta.touched ? meta.errors : []"
              class="w-56"
            />
          </Field>
          <Field name="endDateTime" v-slot="{ field, meta }">
            <v-text-field
              v-bind="field"
              label="End Date & Time"
              type="datetime-local"
              :error-messages="meta.touched ? meta.errors : []"
              class="w-56"
            />
          </Field>
          <Field name="driverId" v-slot="{ field, meta }">
            <v-select
              v-bind="field"
              label="Select Driver"
              :items="dropdown.drivers"
              placeholder="Select driver"
              :error-messages="meta.touched ? meta.errors : []"
              class="w-56"
            />
          </Field>
          <Field name="carId" v-slot="{ field, meta }">
            <v-select
              v-bind="field"
              label="Select Car"
              :items="dropdown.cars"
              placeholder="Select car"
              :error-messages="meta.touched ? meta.errors : []"
              class="w-56"
            />
          </Field>
          <Field name="eMoneyId" v-slot="{ field, meta }">
            <v-select
              v-bind="field"
              label="Select E-Money"
              :items="dropdown.eMoneys"
              placeholder="Select E-Money"
              :error-messages="meta.touched ? meta.errors : []"
              class="w-56"
            />
          </Field>
          <Field name="rating" v-slot="{ field, meta }">
            <v-select
              v-bind="field"
              label="Select Rating"
              :items="[1, 2, 3, 4, 5]"
              placeholder="Select Rating"
              :error-messages="meta.touched ? meta.errors : []"
              class="w-56"
            />
          </Field>
        </div>

        <div class="flex gap-4">
          <button
            @click="clearFilterHandler"
            type="button"
            class="material-symbols-outlined bg-red-600 text-white w-24 rounded h-14"
          >
            clear
          </button>
          <button
            class="material-symbols-outlined bg-blue-600 text-white w-24 rounded h-14"
          >
            search
          </button>
          <button
            @click.prevent="downloadExcelHandler(values)"
            type="button"
            class="material-symbols-outlined bg-green-600 text-white w-24 rounded h-14"
          >
            description
          </button>
        </div>
      </Form>
    </div>

    <!--  Trip Count and Average Rating Section -->
    <div
      class="flex justify-around items-center bg-gray-100 shadow rounded py-2 w-full"
    >
      <!-- Trip Count -->
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600">{{ this.tripCount }}</div>
        <div class="text-black">Trip Count</div>
      </div>

      <!-- Divider (optional) -->
      <div class="h-12 border-l-2 border-gray-300"></div>

      <!-- Average Rating -->
      <div class="text-center">
        <div class="text-2xl font-bold text-yellow-500">
          {{ this.avgRating }}
        </div>
        <div class="text-black">Average Rating</div>
      </div>
    </div>

    <!-- Table Section -->
    <v-table class="rounded flex bg-gray-100 shadow">
      <thead>
        <tr>
          <th class="text-center">Passenger</th>
          <th class="text-center">Destination</th>
          <th class="text-center">Location</th>
          <th class="text-center">Purpose</th>
          <th class="text-center text-nowrap">Start Date & Time</th>
          <th class="text-center text-nowrap">End Date & Time</th>
          <th class="text-center">Driver</th>
          <th class="text-center">Car</th>
          <th class="text-center">Company</th>
          <th class="text-center">Division</th>
          <th class="text-center text-nowrap">E-Money</th>
          <th class="text-center">Rating</th>
          <th class="text-center">Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="trip in trips" :key="trip.id">
          <td class="text-center text-nowrap">{{ trip.passenger }}</td>
          <td class="text-center text-nowrap">{{ trip.destination }}</td>
          <td class="text-center text-nowrap">{{ trip.location }}</td>
          <td class="text-center text-nowrap">{{ trip.purpose }}</td>
          <td class="text-center text-nowrap">
            {{ formatDate(trip.startDateTime) }}
          </td>
          <td class="text-center text-nowrap">
            {{ formatDate(trip.endDateTime) }}
          </td>
          <td class="text-center text-nowrap">{{ trip.Driver.name }}</td>
          <td class="text-center text-nowrap">
            {{ trip.Car.name }} - {{ trip.Car.plateNumber }}
          </td>
          <td class="text-center text-nowrap">{{ trip.Company.name }}</td>
          <td class="text-center text-nowrap">{{ trip.Division.name }}</td>
          <td class="text-center text-nowrap">{{ trip.EMoney.name }}</td>
          <td class="text-center text-nowrap">
            <span
              v-for="star in 5"
              :key="star"
              class="material-symbols-outlined"
              :class="{
                'text-yellow-400':
                  trip.reviewStatus && star <= trip.Review.rating,
                'text-gray-400':
                  !trip.reviewStatus || star > trip.Review.rating,
              }"
            >
              star
            </span>
          </td>
          <td class="items-center justify-center flex gap-2">
            <v-btn
              class="bg-green-600 text-white w-24"
              @click="detailModalToggle(trip.Review.feedback)"
              v-show="trip.reviewStatus"
            >
              Detail
            </v-btn>
            <v-btn
              class="bg-blue-600 text-white w-24"
              @click="copyToClipboard(trip.id)"
            >
              Review
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pagination Section -->
    <div class="flex items-center justify-center">
      <div
        class="inline-flex items-center justify-center gap-3 bg-gray-100 py-2 rounded w-36 shadow rounded"
      >
        <!-- Previous Page Button -->
        <a
          href="#"
          class="inline-flex size-8 items-center justify-center rounded border border-black border-solid bg-gray-300 text-gray-900 rtl:rotate-180"
          v-show="query.currentPage > 1"
          @click="backPage"
        >
          <span class="sr-only">Previous Page</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </a>

        <!-- Current Page Indicator -->
        <p class="text-xs text-gray-900" v-show="query.totalPages > 0">
          {{ query.currentPage }}
          <span class="mx-0.25">/</span>
          {{ query.totalPages }}
        </p>
        <p v-show="query.totalPages <= 0">No data found</p>

        <!-- Next Page Button -->
        <a
          href="#"
          class="inline-flex size-8 items-center justify-center rounded border border-black border-solid bg-gray-300 text-gray-900 rtl:rotate-180"
          v-show="query.currentPage < query.totalPages"
          @click="nextPage"
        >
          <span class="sr-only">Next Page</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>

    <!-- Create Modal Section -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
    >
      <div
        class="modal-backdrop fixed inset-0 bg-black opacity-50"
        @click="createModalToggle"
      ></div>
      <v-card class="bg-green-100 flex flex-col rounded p-8 w-3/5">
        <v-card-text>
          <Form
            :validation-schema="addTripValidationSchema"
            @submit="addTripHandler"
          >
            <v-row>
              <v-col cols="4">
                <div class="mb-4">
                  <Field name="passenger" v-slot="{ field, meta }">
                    <v-text-field
                      v-bind="field"
                      label="Passenger"
                      placeholder="Enter passenger name"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>

                <div class="mb-4">
                  <Field name="companyId" v-slot="{ field, meta }">
                    <v-select
                      v-bind="field"
                      label="Select Company"
                      :items="dropdown.companies"
                      placeholder="Select company"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>

                <div class="mb-4">
                  <Field name="divisionId" v-slot="{ field, meta }">
                    <v-select
                      v-bind="field"
                      label="Select Division"
                      :items="dropdown.divisions"
                      placeholder="Select division"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>

                <div class="mb-4">
                  <Field name="startDateTime" v-slot="{ field, meta }">
                    <v-text-field
                      v-bind="field"
                      label="Start Date & Time"
                      type="datetime-local"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>
              </v-col>

              <v-col cols="4">
                <div class="mb-4">
                  <Field name="destination" v-slot="{ field, meta }">
                    <v-text-field
                      v-bind="field"
                      label="Destination"
                      placeholder="Enter trip destination"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>

                <div class="mb-4">
                  <Field name="location" v-slot="{ field, meta }">
                    <v-text-field
                      v-bind="field"
                      label="Location"
                      placeholder="Enter trip location"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>

                <div class="mb-4">
                  <Field name="purpose" v-slot="{ field, meta }">
                    <v-text-field
                      v-bind="field"
                      label="Purpose"
                      placeholder="Enter trip purpose"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>

                <div class="mb-4">
                  <Field name="endDateTime" v-slot="{ field, meta }">
                    <v-text-field
                      v-bind="field"
                      label="End Date & Time"
                      type="datetime-local"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>
              </v-col>

              <v-col cols="4">
                <div class="mb-4">
                  <Field name="driverId" v-slot="{ field, meta }">
                    <v-select
                      v-bind="field"
                      label="Select Driver"
                      :items="dropdown.drivers"
                      placeholder="Select driver"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>

                <div class="mb-4">
                  <Field name="carId" v-slot="{ field, meta }">
                    <v-select
                      v-bind="field"
                      label="Select Car"
                      :items="dropdown.cars"
                      placeholder="Select car"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>

                <div class="mb-4">
                  <Field name="eMoneyId" v-slot="{ field, meta }">
                    <v-select
                      v-bind="field"
                      label="Select E-Money"
                      :items="dropdown.eMoneys"
                      placeholder="Select E-Money"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>
              </v-col>
            </v-row>

            <!-- Buttons (Center-Aligned) -->
            <div class="flex justify-between gap-4">
              <v-btn
                @click="createModalToggle"
                class="material-symbols-outlined bg-red-600 text-white w-48 mb-4 text-3xl font-bold"
              >
                clear
              </v-btn>
              <v-btn
                type="submit"
                class="material-symbols-outlined bg-blue-600 text-white text-3xl font-bold w-48 mb-4"
              >
                add
              </v-btn>
            </div>
          </Form>
        </v-card-text>
      </v-card>
    </div>

    <!-- Detail Modal Section -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
    >
      <div
        class="modal-backdrop fixed inset-0 bg-black opacity-50"
        @click="detailModalToggle"
      ></div>
      <v-card class="bg-green-100 rounded p-4 w-2/5 h-2/5">
        <v-card-text class="">
          <div>
            <h2 class="text-center text-xl font-bold mb-4">Feedback</h2>
          </div>
          <div>
            <pre class="text-lg">{{ this.feedback }}</pre>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<!-- <div v-if="this.divisions.length === 0">
        <p class="font-bold text-xl">No Data Found</p>
      </div> -->
