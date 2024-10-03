<script>
import { RouterLink } from "vue-router";
export default {
  name: "TripPage",
  data() {
    return {
      desserts: [
        {
          name: "Frozen Yogurt",
          calories: 159,
        },
        {
          name: "Ice cream sandwich",
          calories: 237,
        },
        {
          name: "Eclair",
          calories: 262,
        },
        {
          name: "Cupcake",
          calories: 305,
        },
        {
          name: "Gingerbread",
          calories: 356,
        },
        {
          name: "Jelly bean",
          calories: 375,
        },
        {
          name: "Lollipop",
          calories: 392,
        },
        {
          name: "Honeycomb",
          calories: 408,
        },
        {
          name: "Donut",
          calories: 452,
        },
        {
          name: "KitKat",
          calories: 518,
        },
      ],
    };
  },
  methods: {
    copyToClipboard() {
      navigator.clipboard
        .writeText(`http://localhost:5000/review`)
        .then(() => {
          this.$toast.success("Copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    },
  },
};
</script>

<template>
  <div class="container mx-auto p-8">
    <!-- Heading and Add Trip Button -->
    <div class="flex justify-between items-center mb-4">
      <!-- Left: Trip List Title -->
      <div class="text-3xl font-bold">
        <h1>Trip List</h1>
      </div>

      <!-- Right: Add Trip Button -->
      <v-btn class="material-symbols-outlined bg-blue-500 text-white text-3xl w-24"
        >add</v-btn
      >
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
          <th class="text-center">Hour</th>
          <th class="text-center">Date</th>
          <th class="text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center">A1B2C3D4F5G6H7</td>
          <td class="text-center">Efendi</td>
          <td class="text-center">Amir</td>
          <td class="text-center">Rush Hitam</td>
          <td class="text-center">Abadi Klender</td>
          <td class="text-center">18:00</td>
          <td class="text-center">19/10/2024</td>
          <td class="flex items-center gap-2 justify-center">
            <v-btn
              class="bg-green-600 text-white p-2 w-24"
              @click="copyToClipboard"
            >
              Copy Link
            </v-btn>
            <RouterLink to="/review">
              <v-btn class="bg-blue-600 text-white p-2 w-24"> Review </v-btn>
            </RouterLink>
          </td>
        </tr>
        <!-- Additional rows can be repeated as needed -->
      </tbody>
    </v-table>
  </div>
</template>

<!-- <div v-if="this.divisions.length === 0">
        <p class="font-bold text-xl">No Data Found</p>
      </div> -->
