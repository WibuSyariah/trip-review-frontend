<script>
import { useTripStore } from "@/stores/trip";
import { useReviewStore } from "@/stores/review";
import dayjs from "dayjs";
import { mapWritableState, mapActions } from "pinia";

export default {
  data() {
    return {
      rating: 0,
      hoverRating: 0,
      feedback: "",
      complaintItems: [],
      selectedComplaints: [],
      loading: true, // Add a loading state variable
      tripDetail: null, // Add a trip detail variable
    };
  },
  async mounted() {
    const tripId = this.$route.params.tripId;
    try {
      await this.fetchTripDetail(tripId);
    } catch (error) {
      console.error("Error fetching trip detail:", error);
    } finally {
      this.loading = false; // Set loading to false after fetching
    }
  },
  computed: {
    ...mapWritableState(useTripStore, ["trip"]),

    isSubmitDisabled() {
      if (this.rating <= 3 && !this.feedback) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    ...mapActions(useTripStore, ["fetchTripDetail"]),
    ...mapActions(useReviewStore, ["createReview"]),

    formatDate(dateString) {
      return dayjs(dateString).format("HH:mm MM/D/YYYY");
    },
    setRating(star) {
      this.rating = star;
      this.updateComplaintItems(star);
    },
    updateComplaintItems(rating) {
      if (rating <= 2) {
        this.complaintItems = [
          "Dirty Car",
          "Traffic Violation",
          "Rude Driver",
          "Drive Recklessly",
        ];
      } else if (rating <= 4) {
        this.complaintItems = ["Dirty Car", "Rude Driver", "Drive Recklessly"];
      } else {
        this.complaintItems = [
          "Clean Car",
          "Friendly Driver",
          "Good Driving Skill",
        ];
      }
      this.selectedComplaints = []; // Reset selected complaints when rating changes
    },
    toggleComplaint(item) {
      const index = this.selectedComplaints.indexOf(item);
      if (index === -1) {
        this.selectedComplaints.push(item);
      } else {
        this.selectedComplaints.splice(index, 1);
      }
    },
    async submitReviewHandler() {
      try {
        let itemsString = this.convertArrayToString(this.selectedComplaints);

        if (itemsString) {
          this.feedback = this.feedback + `\n${itemsString}`;
        }

        const res = await this.createReview({
          tripId: this.$route.params.tripId,
          rating: this.rating,
          feedback: this.feedback,
        });

        if (res.status === 201) {
          // Check for successful response
          this.$toast.success("Review submitted successfully");
        }
      } catch (error) {
        this.feedback = "";
        console.error(error);
      }
    },
    convertArrayToString(selectedItems) {
      // Check if the array is empty
      if (selectedItems.length === 0) {
        return false;
      }

      // Convert the array into a string, separated by commas
      const complaintsString = selectedItems.join(", ");

      // Return the concatenated string
      return complaintsString;
    },
  },
};
</script>

<template>
  <div class="container mx-auto p-4">
    <div
      class="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto md:max-w-xl lg:max-w-2xl"
    >
      <!-- Loading Indicator -->
      <div v-if="loading" class="text-center">
        <!-- Optionally, you can add a spinner here -->
        <v-progress-circular indeterminate color="blue" />
      </div>

      <!-- Trip Details -->
      <div v-else>
        <div class="mb-4 text-center flex flex-col items-center gap-4">
          <h2 class="text-xl font-semibold">
            Trip with {{ trip.Driver.name }}
          </h2>
          <img
            crossorigin="anonymous"
            :src="trip.Driver.image"
            alt="Trip Image"
            class="w-24 h-24"
          />
          <h2 class="font-semibold">
            {{ trip.destination }}
          </h2>
          <h2 class="font-semibold">
            {{ trip.location }}
          </h2>
          <p class="text-gray-600 text-nowrap">
            {{ formatDate(trip.startDateTime) }} -
            {{ formatDate(trip.endDateTime) }}
          </p>
        </div>

        <!-- Star Rating -->
        <div class="flex flex-col justify-center items-center mb-4 gap-2">
          <p class="text-lg">Rate the Driver</p>
          <div class="flex space-x-1">
            <i
              v-for="star in 5"
              :key="star"
              class="material-symbols-outlined cursor-pointer"
              :class="{
                'text-yellow-400': star <= rating || star <= hoverRating,
                'text-gray-400': star > rating && star > hoverRating,
              }"
              @click="setRating(star)"
              @mouseover="hoverRating = star"
              @mouseleave="hoverRating = 0"
            >
              star
            </i>
          </div>
        </div>

        <!-- Dynamic Complaint Items -->
        <div v-if="rating > 0" class="mb-4">
          <p class="text-lg">Tell us more:</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="(item, index) in complaintItems"
              :key="index"
              class="px-4 py-2 border rounded-md cursor-pointer"
              :class="{ 'bg-gray-200': selectedComplaints.includes(item) }"
              @click="toggleComplaint(item)"
            >
              {{ item }}
            </button>
          </div>
        </div>

        <!-- Feedback Form -->
        <div class="mb-4">
          <label for="feedback" class="block text-sm font-medium text-gray-700"
            >Feedback</label
          >
          <textarea
            v-model="feedback"
            class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
            placeholder="Leave your feedback..."
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button
          type="button"
          class="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 ease-in-out cursor-pointer"
          @click="submitReviewHandler"
          :disabled="isSubmitDisabled"
        >
          Submit Review
        </button>

        <h1 v-show="isSubmitDisabled && rating !== 0" class="mt-2">
          Feedback is required if your rating is 3 or below.
        </h1>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-size: 32px;
  transition: color 0.3s ease;
}
</style>
