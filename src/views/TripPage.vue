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
      validationSchema: yup.object({
        passenger: yup.string().required("Passenger is required"),
        location: yup.string().required("Location is required"),
        date: yup.string().required("Date & Time is required"),
        driverId: yup.string().required("Driver is required"),
        carId: yup.string().required("Car is required"),
        divisionId: yup.string().required("Division is required"),
        emoneyId: yup.string().required("E-money is required"),
      }),
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
  <div class="container p-8">
    <!-- Heading and Add Trip Button -->
    <div class="flex justify-between items-center mb-4">
      <!-- Left: Trip List Title -->
      <div class="text-3xl font-bold">
        <h1>Trip List</h1>
      </div>

      <!-- Right: Add Trip Button -->
      <v-btn
        class="material-symbols-outlined bg-blue-600 text-white text-3xl w-24"
        @click="createModalToggle"
      >
        add
      </v-btn>
    </div>

    <!-- Table Section -->
    <v-table>
      <thead>
        <tr>
          <th class="text-center">Trip Code</th>
          <th class="text-center">Passenger</th>
          <th class="text-center">Driver</th>
          <th class="text-center">Car</th>
          <th class="text-center">Location</th>
          <th class="text-center">Date & Time</th>
          <th class="text-center">Status</th>
          <th class="text-center">Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="trip in trips" :key="trip.id">
          <td class="text-center">{{ trip.id }}</td>
          <td class="text-center">{{ trip.passenger }}</td>
          <td class="text-center">{{ trip.Driver.name }}</td>
          <td class="text-center">
            {{ trip.Car.name }} - {{ trip.Car.plateNumber }}
          </td>
          <td class="text-center">{{ trip.location }}</td>
          <td class="text-center">{{ formatDate(trip.date) }}</td>
          <td
            :class="trip.reviewStatus ? 'text-yellow-400' : 'text-gray-400'"
            class="text-center"
          >
            <span class="material-symbols-outlined p-1">star</span>
          </td>
          <td class="items-center justify-center flex gap-2">
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
      <v-card class="bg-green-100 flex flex-col rounded p-8 w-2/5">
        <v-card-text>
          <Form :validation-schema="validationSchema" @submit="addTripHandler">
            <v-row>
              <!-- Left Column (3 inputs) -->
              <v-col cols="6">
                <!-- Passenger Text Input -->
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

                <!-- Location Text Input -->
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

                <!-- DateTime Input (Combined Date and Time) -->
                <div class="mb-4">
                  <Field name="date" v-slot="{ field, meta }">
                    <v-text-field
                      v-bind="field"
                      label="Date & Time"
                      type="datetime-local"
                      placeholder="Select trip date and time"
                      :error-messages="meta.touched ? meta.errors : []"
                    />
                  </Field>
                </div>
              </v-col>

              <!-- Right Column (4 select inputs) -->
              <v-col cols="6">
                <!-- Dropdown 1: Driver -->
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

                <!-- Dropdown 2: Car -->
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

                <!-- Dropdown 3: Division -->
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

                <!-- Dropdown 4: E-money -->
                <div class="mb-4">
                  <Field name="emoneyId" v-slot="{ field, meta }">
                    <v-select
                      v-bind="field"
                      label="Select E-money"
                      :items="dropdown.emoneys"
                      placeholder="Select E-money"
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
                class="bg-red-500 text-white w-48 mb-4"
              >
                Cancel
              </v-btn>
              <v-btn type="submit" class="bg-green-500 text-white w-48 mb-4">
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
