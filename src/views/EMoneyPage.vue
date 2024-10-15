<script>
import { mapWritableState, mapActions } from "pinia";
import { useEMoneyStore } from "@/stores/eMoney";
import { Form, Field } from "vee-validate";
import * as yup from "yup";

export default {
  name: "EMoneyPage",
  data() {
    return {
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      editId: 0,
      deleteId: 0,
      eMoneyValidationSchema: yup.object({
        name: yup.string().required("Name is required"),
      }),
    };
  },
  mounted() {
    this.fetchEMoney(this.query);
    document.addEventListener("keydown", this.escKeyHandler);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.escKeyHandler);
  },
  computed: {
    ...mapWritableState(useEMoneyStore, [
      "eMoneys",
      "query",
      "defaultQuery",
    ]),
  },
  components: {
    Form,
    Field,
  },
  methods: {
    ...mapActions(useEMoneyStore, [
      "fetchEMoney",
      "createEMoney",
      "editEMoney",
      "deleteEMoney",
    ]),

    async filterHandler(values) {
      this.query = {
        ...this.query,
        ...values,
        currentPage: 1,
      };

      await this.fetchEMoney(this.query);
    },

    async clearFilterHandler() {
      this.query = {
        limit: 10,
        currentPage: 1,
        totalPages: 1,
      };

      await this.fetchEMoney(this.query);
    },

    createModalToggle() {
      this.showCreateModal = !this.showCreateModal;
    },

    async addEMoneyHandler(values) {
      try {
        const res = await this.createEMoney(values);

        if (res.status === 201) {
          // Check for successful response
          this.fetchEMoney(this.defaultQuery);
          this.$toast.success(res.data.message);
          this.showCreateModal = false;
        }
      } catch (error) {
        console.error(error);
      }
    },

    editModalToggle(eMoneyId) {
      this.editId = eMoneyId;
      this.showEditModal = true;
    },

    async editEMoneyHandler(values) {
      try {
        const res = await this.editEMoney(this.editId, values);

        if (res.status === 200) {
          // Check for successful response
          this.fetchEMoney(this.defaultQuery);
          this.showEditModal = false;
          this.editId = null;
          this.$toast.success(res.data.message);
        }
      } catch (error) {
        console.error(error);
      }
    },

    deleteModalToggle(eMoneyId) {
      this.deleteId = eMoneyId;
      this.showDeleteModal = true;
    },

    async deleteEMoneyHandler() {
      try {
        const res = await this.deleteEMoney(this.deleteId);

        if (res.status === 200) {
          // Check for successful response
          this.fetchEMoney(this.defaultQuery);
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

      await this.fetchEMoney(this.query);
    },

    async backPage() {
      this.query.currentPage--;

      await this.fetchEMoney(this.query);
    },
  },
};
</script>

<template>
  <div class="w-full pr-4 pl-4 py-8 flex flex-col gap-4">
    <!-- Heading and Add EMoney Button -->
    <div class="flex justify-between items-center">
      <!-- Left: EMoney List Title -->
      <div class="text-2xl font-bold">
        <h1>EMoney List</h1>
      </div>

      <!-- Right: Add EMoney Button -->
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
    <v-table class="rounded flex bg-gray-100 shadow">
      <thead>
        <tr>
          <th class="text-center w-1/2">Name</th>
          <th class="text-center w-1/2">Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="eMoney in eMoneys" :key="eMoney.id">
          <td class="text-center text-nowrap">{{ eMoney.name }}</td>
          <td class="items-center justify-center flex gap-2">
            <v-btn
              class="material-symbols-outlined bg-red-600 text-white w-24"
              @click="deleteModalToggle(eMoney.id)"
            >
              delete
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
      <v-card class="bg-green-100 flex flex-col rounded p-4 w-3/6 h-2/6">
        <v-card-text class="flex flex-col justify-center">
          <Form
            :validation-schema="eMoneyValidationSchema"
            @submit="addEMoneyHandler"
          >
            <Field name="name" v-slot="{ field, meta }">
              <v-text-field
                v-bind="field"
                label="Name"
                placeholder="Enter Name"
                :error-messages="meta.touched ? meta.errors : []"
              />
            </Field>

            <!-- Buttons (Center-Aligned) -->
            <div class="flex justify-between">
              <v-btn
                @click="createModalToggle"
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
          </Form>
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
            @click="deleteEMoneyHandler"
          >
            check
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>
