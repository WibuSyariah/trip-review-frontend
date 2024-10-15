<script>
import { mapWritableState, mapActions } from "pinia";
import { useDriverStore } from "@/stores/driver";
import { Form, Field } from "vee-validate";
import * as yup from "yup";

export default {
  name: "DriverPage",
  data() {
    return {
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      editId: 0,
      deleteId: 0,
      name: "",
      image: null,
    };
  },
  mounted() {
    this.fetchDriver(this.query);
    document.addEventListener("keydown", this.escKeyHandler);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.escKeyHandler);
  },
  computed: {
    ...mapWritableState(useDriverStore, ["drivers", "query", "defaultQuery"]),
  },
  components: {
    Form,
    Field,
  },
  methods: {
    ...mapActions(useDriverStore, [
      "fetchDriver",
      "createDriver",
      "editDriver",
      "deleteDriver",
    ]),

    async filterHandler(values) {
      this.query = {
        ...this.query,
        ...values,
        currentPage: 1,
      };

      await this.fetchDriver(this.query);
    },

    async clearFilterHandler() {
      this.query = {
        limit: 10,
        currentPage: 1,
        totalPages: 1,
      };

      await this.fetchDriver(this.query);
    },

    createModalToggle() {
      this.showCreateModal = !this.showCreateModal;
    },

    async addDriverHandler() {
      // Handle the form submission (e.g., upload the file)
      const formData = new FormData();
      formData.append("name", this.name);
      formData.append("image", this.image);

      const res = await this.createDriver(formData);

      if (res.status === 201) {
        // Check for successful response
        this.fetchDriver(this.defaultQuery);
        this.$toast.success(res.data.message);
        this.showCreateModal = false;
        this.name = "";
        this.image = null;
      }
    },

    handleFileChange(event) {
      const file = event.target.files[0]; // Get the file object from input
      if (file) {
        this.image = file; // Set the file to the 'image' data property
        this.imageUrl = URL.createObjectURL(file); // Generate a URL for previewing the image
      }
    },

    editModalToggle(driverId) {
      this.editId = driverId;
      this.showEditModal = true;
    },

    async editDriverHandler() {
      try {
        const formData = new FormData();
        formData.append("name", this.name);
        formData.append("image", this.image);

        const res = await this.editDriver(this.editId, formData);

        if (res.status === 200) {
          // Check for successful response
          this.fetchDriver(this.defaultQuery);
          this.showEditModal = false;
          this.editId = null;
          this.$toast.success(res.data.message);
          this.name = "";
          this.image = null;
        }
      } catch (error) {
        console.error(error);
      }
    },

    deleteModalToggle(driverId) {
      this.deleteId = driverId;
      this.showDeleteModal = true;
    },

    async deleteDriverHandler() {
      try {
        const res = await this.deleteDriver(this.deleteId);

        if (res.status === 200) {
          // Check for successful response
          this.fetchDriver(this.defaultQuery);
          this.showDeleteModal = false;
          this.deleteId = null;
          this.$toast.success(res.data.message);
        }
      } catch (error) {
        console.error(error);
      }
    },

    escKeyHandler(event) {
      if (event.key === "Escape") {
        this.showCreateModal = false;
        this.showEditModal = false;
        this.showDeleteModal = false;
      }
    },

    async nextPage() {
      this.query.currentPage++;

      await this.fetchDriver(this.query);
    },

    async backPage() {
      this.query.currentPage--;

      await this.fetchDriver(this.query);
    },
  },
};
</script>

<template>
  <div class="w-full pr-4 pl-4 py-8 flex flex-col gap-4">
    <!-- Heading and Add Driver Button -->
    <div class="flex justify-between items-center">
      <!-- Left: Driver List Title -->
      <div class="text-2xl font-bold">
        <h1>Driver List</h1>
      </div>

      <!-- Right: Add Driver Button -->
      <div class="flex gap-4">
        <v-btn
          class="material-symbols-outlined bg-blue-600 text-white w-24 text-2xl font-bold"
          @click="createModalToggle"
        >
          add
        </v-btn>
      </div>
    </div>

    <!-- Table Section -->
    <v-table class="rounded flex bg-gray-100 shadow overflow-y-hidden">
      <thead>
        <tr>
          <th class="text-center w-1/3">Name</th>
          <th class="text-center w-1/3">Image</th>
          <th class="text-center w-1/3">Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="driver in drivers" :key="driver.id">
          <td class="text-center text-nowrap">{{ driver.name }}</td>
          <td>
            <img
              class="block mx-auto w-24 h-32 p-2"
              crossorigin="anonymous"
              :src="driver.image"
            />
          </td>
          <td class="text-center">
            <div class="flex justify-center gap-2">
              <v-btn
                class="material-symbols-outlined bg-green-600 text-white w-24"
                @click="editModalToggle(driver.id)"
              >
                edit
              </v-btn>
              <v-btn
                class="material-symbols-outlined bg-red-600 text-white w-24"
                @click="deleteModalToggle(driver.id)"
              >
                delete
              </v-btn>
            </div>
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
      <v-card class="bg-green-100 flex flex-col rounded p-4 w-3/6 h-2/6">
        <v-card-text class="flex flex-col justify-center">
          <form @submit.prevent="addDriverHandler">
            <v-row class="flex mb-2 justify-center">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="name"
                  label="Name"
                  placeholder="Enter name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-file-input
                  label="Image"
                  placeholder="Select File"
                  :error-messages="imageError"
                  @change="handleFileChange"
                  prepend-icon=""
                  class="overflow-hidden whitespace-nowrap truncate"
                />
              </v-col>
            </v-row>

            <!-- Button -->
            <div class="flex justify-between">
              <v-btn
                @click="showCreateModal = false"
                class="material-symbols-outlined bg-red-600 text-white w-48 mb-4 text-2xl font-bold"
              >
                clear
              </v-btn>
              <v-btn
                type="submit"
                class="material-symbols-outlined bg-blue-600 text-white text-2xl font-bold w-48 mb-4"
              >
                add
              </v-btn>
            </div>
          </form>
        </v-card-text>
      </v-card>
    </div>

    <!-- Edit Modal Section -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
    >
      <div
        class="modal-backdrop fixed inset-0 bg-black opacity-50"
        @click="showEditModal = false"
      ></div>
      <v-card class="bg-green-100 flex flex-col rounded p-4 w-3/6 h-2/6">
        <v-card-text class="flex flex-col justify-center">
          <form @submit.prevent="editDriverHandler">
            <v-row class="flex mb-2 justify-center">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="name"
                  label="Name"
                  placeholder="Enter name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-file-input
                  label="Image"
                  placeholder="Select File"
                  :error-messages="imageError"
                  @change="handleFileChange"
                  prepend-icon=""
                  class="overflow-hidden whitespace-nowrap truncate"
                />
              </v-col>
            </v-row>

            <!-- Button -->
            <div class="flex justify-between">
              <v-btn
                @click="showCreateModal = false"
                class="material-symbols-outlined bg-red-600 text-white w-48 mb-4 text-2xl font-bold"
              >
                clear
              </v-btn>
              <v-btn
                type="submit"
                class="material-symbols-outlined bg-blue-600 text-white text-2xl font-bold w-48 mb-4"
              >
                edit
              </v-btn>
            </div>
          </form>
        </v-card-text>
      </v-card>
    </div>

    <!-- Delete Modal Section -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
    >
      <div
        class="modal-backdrop fixed inset-0 bg-black opacity-50"
        @click="showDeleteModal = false"
      ></div>
      <v-card
        class="bg-green-100 rounded p-4 w-2/6 h-fit flex flex-col justify-"
      >
        <v-card-text>
          <h2 class="text-center text-xl font-bold mb-4">Are you sure?</h2>
        </v-card-text>
        <v-card-actions class="flex justify-between">
          <v-btn
            class="material-symbols-outlined bg-red-600 text-white w-48 text-2xl font-bold"
            @click="showDeleteModal = false"
          >
            clear
          </v-btn>
          <v-btn
            class="material-symbols-outlined bg-blue-600 text-white w-48 text-2xl font-bold"
            @click="deleteDriverHandler"
          >
            check
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>
