<template>
  <div class="container mx-auto p-4">
    <div
      class="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto md:max-w-xl lg:max-w-2xl"
    >
      <!-- Trip Details -->
      <div class="mb-4 text-center">
        <h2 class="text-xl font-semibold">Trip with {{ driverName }}</h2>
        <h2 class="text-xl font-semibold">To {{ location }}</h2>
        <p class="text-gray-600">{{ tripDate }}</p>
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
        class="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 ease-in-out"
        @click="submitReview"
      >
        Submit Review
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      driverName: "Amir",
      tripDate: "September 26, 2024",
      location: "Abadi Klender",
      rating: 0,
      hoverRating: 0,
      feedback: "",
      complaintItems: [],
      selectedComplaints: [],
    };
  },
  methods: {
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
    submitReview() {
      // Handle form submission, including sending the rating, feedback, and selected complaints
      console.log("Rating:", this.rating);
      console.log("Selected Complaints:", this.selectedComplaints);
      console.log("Feedback:", this.feedback);
    },
    convertArrayToString(selectedItems) {
      // Check if the array is empty
      if (selectedItems.length === 0) {
        return "No complaints selected"; // Return a message if no items are selected
      }

      // Convert the array into a string, separated by commas
      const complaintsString = selectedItems.join(", ");

      // Return the concatenated string
      return complaintsString;
    },
  },
};
</script>

<style scoped>
.material-symbols-outlined {
  font-size: 32px;
  transition: color 0.3s ease;
}
</style>
