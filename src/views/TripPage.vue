<script>
import { RouterLink } from "vue-router";
import { mapWritableState, mapActions } from "pinia";
import { useTripStore } from "@/stores/trip";
import dayjs from "dayjs";
import { Form, Field, useForm } from "vee-validate";
import * as yup from "yup";

export default {
  name: "TripPage",
  data() {
    return {
      showCreateModal: false,
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

      await this.fetchTrip(this.query);
    },

    createModalToggle() {
      this.showCreateModal = !this.showCreateModal;
    },

    formatDate(dateString) {
      return dayjs(dateString).format("HH:mm DD/MM/YYYY");
    },

    copyToClipboard(tripId) {
      navigator.clipboard
        .writeText(`http://localhost:5000/trip/${tripId}/review`)
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
      }
    },

    async addTripHandler(values) {
      try {
        console.log(values, "cek values");
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
  },
};
</script>

<template>
  <div class="w-full pr-8 pl-4 py-8">
    <!-- Heading and Add Trip Button -->
    <div class="flex justify-between items-center mb-8">
      <!-- Left: Trip List Title -->
      <div class="text-3xl font-bold">
        <h1>Trip List</h1>
      </div>

      <!-- Right: Add Trip Button -->
      <div class="flex gap-4">
        <v-btn class="bg-green-600 text-white w-24" @click="createModalToggle">
          Excel
        </v-btn>
        <v-btn class="bg-blue-600 text-white w-24" @click="createModalToggle">
          Add
        </v-btn>
      </div>
    </div>

    <div
      class="flex mb-4 pt-6 overflow-x-auto justify-center bg-gray-100 rounded"
    >
      <Form
        class="flex gap-4"
        :validation-schema="filterTripValidationSchema"
        @submit="filterHandler"
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
        </div>
      </Form>
    </div>

    <!-- Table Section -->
    <v-table class="rounded bg-gray-100">
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
          <th class="text-center">Status</th>
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
          <td
            :class="trip.reviewStatus ? 'text-yellow-400' : 'text-gray-400'"
            class="text-center text-nowrap"
          >
            <span class="material-symbols-outlined p-1">star</span>
          </td>
          <td class="items-center flex gap-2">
            <v-btn
              class="bg-green-600 text-white w-24"
              @click="copyToClipboard(trip.id)"
            >
              Copy Link
            </v-btn>
            <RouterLink :to="`/trip/${trip.id}/review`">
              <v-btn class="bg-blue-600 text-white w-24"> Review </v-btn>
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </v-table>

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
                class="bg-red-600 text-white w-48 mb-4"
              >
                Cancel
              </v-btn>
              <v-btn type="submit" class="bg-green-600 text-white w-48 mb-4">
                Add Trip
              </v-btn>
            </div>
          </Form>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<!-- <div v-if="this.divisions.length === 0">
        <p class="font-bold text-xl">No Data Found</p>
      </div> -->
