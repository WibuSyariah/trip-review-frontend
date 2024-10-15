<script>
import { useAuthStore } from "@/stores/auth";
import { mapActions } from "pinia";
import { RouterLink } from "vue-router";
import { Form, Field, useForm } from "vee-validate";
import * as yup from "yup";

export default {
  name: "Sidebar",
  data() {
    return {
      showSidebar: false,
      sidebarIcon: "arrow_right",
      showMasterData: false,
      showTripReview: false,
      dropdownIcon: "keyboard_arrow_down",
      showModal: false,
      role: localStorage.getItem("role"),
      validationSchema: yup.object({
        newPassword: yup.string().required("New Password is required"),
        confirmPassword: yup
          .string()
          .oneOf([yup.ref("newPassword"), null], "Passwords must match")
          .required("Confirm Password is required"),
      }),
    };
  },
  mounted() {
    document.addEventListener("keydown", this.escKeyHandler);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.escKeyHandler);
  },
  components: {
    Form,
    Field,
  },
  methods: {
    ...mapActions(useAuthStore, ["changePassword"]),

    masterDataToggle() {
      this.showMasterData = !this.showMasterData;
    },
    tripReviewToggle() {
      this.showTripReview = !this.showTripReview;
    },
    sidebarToggle() {
      if (this.sidebarIcon === "arrow_left") {
        this.sidebarIcon = "arrow_right";
      } else {
        this.sidebarIcon = "arrow_left";
      }
      this.showSidebar = !this.showSidebar;
    },
    logoutHandler() {
      localStorage.clear();
      this.$router.push("/login");
    },
    modalToggle() {
      this.showModal = !this.showModal;
    },
    escKeyHandler(event) {
      if (event.key === "Escape") {
        this.showModal = false;
      }
    },
    async changePasswordHandler(values) {
      try {
        const res = await this.changePassword(values);

        if (res.status === 200) {
          // Check for successful response
          this.$toast.success(`Password changed successfully`);
          this.modalToggle();
        } else {
          console.error(res.data); // Handle specific error message
          toast.error(`Password change failed. Please try again.`, {
            position: "bottom-right",
            duration: 3000,
            queue: true,
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<template>
  <div
    class="flex h-screen sticky top-0 bg-green-500 shadow text-nowrap w-fit"
    v-show="showSidebar"
  >
    <div class="flex flex-col overflow-x-hidden overflow-y-auto">
      <div class="mt-8 mx-auto">
        <img
          class="w-32"
          src="https://www.moda-holding.com/wp-content/uploads/2020/03/cropped-MODA-Holding-300x61-1.png"
        />
      </div>
      <div class="mt-4 flex flex-col flex-grow">
        <ul class="space-y-1">
          <div>
            <li
              class="block rounded-lg px-4 pt-2 text-sm font-medium text-black hover:text-gray-700 text-nowrap cursor-pointer flex justify-between"
              @click="tripReviewToggle"
            >
              <span>Trip</span>
              <i class="material-symbols-outlined">{{ dropdownIcon }}</i>
            </li>
            <ul v-show="showTripReview">
              <RouterLink to="/trip">
                <li>
                  <div
                    class="block rounded-lg px-4 py-2 text-sm font-medium text-black hover:text-gray-700"
                  >
                    Trip List
                  </div>
                </li>
              </RouterLink>
            </ul>
          </div>
          <div v-if="role == 0">
            <li
              class="block rounded-lg px-4 pt-2 text-sm font-medium text-black hover:text-gray-700 text-nowrap cursor-pointer flex justify-between"
              @click="masterDataToggle"
            >
              <span>Data Master</span>
              <i class="material-symbols-outlined">{{ dropdownIcon }}</i>
            </li>
            <ul v-show="showMasterData" class="">
              <RouterLink to="/master/user">
                <li>
                  <div
                    class="block rounded-lg px-4 py-2 text-sm font-medium text-black hover:text-gray-700"
                  >
                    User
                  </div>
                </li>
              </RouterLink>
              <RouterLink to="/master/driver">
                <li>
                  <div
                    class="block rounded-lg px-4 py-2 text-sm font-medium text-black hover:text-gray-700"
                  >
                    Driver
                  </div>
                </li>
              </RouterLink>
              <!-- <RouterLink to="/master/car"> -->
              <li>
                <div
                  class="block rounded-lg px-4 py-2 text-sm font-medium text-black hover:text-gray-700"
                >
                  Car
                </div>
              </li>
              <!-- </RouterLink> -->
              <!-- <RouterLink to="/master/division"> -->
              <li>
                <div
                  class="block rounded-lg px-4 py-2 text-sm font-medium text-black hover:text-gray-700"
                >
                  Division
                </div>
              </li>
              <!-- </RouterLink> -->
              <!-- <RouterLink to="/master/e-money"> -->
              <li>
                <div
                  class="block rounded-lg px-4 py-2 text-sm font-medium text-black hover:text-gray-700"
                >
                  E-Money
                </div>
              </li>
              <!-- </RouterLink> -->
            </ul>
          </div>
        </ul>
      </div>
      <ul class="flex flex-col mb-4">
        <li
          class="block rounded-lg px-4 py-2 text-sm font-medium text-black hover:text-gray-700 cursor-pointer"
          @click="modalToggle"
        >
          Change Password
        </li>
        <li
          class="block rounded-lg px-4 py-2 text-sm font-medium text-black hover:text-gray-700 cursor-pointer"
          @click="logoutHandler"
        >
          Log Out
        </li>
      </ul>
    </div>
  </div>
  <div
    @click="sidebarToggle"
    class="cursor-pointer justify-center flex h-screen sticky bg-green-600 shadow rounded-r items-center w-4"
  >
    <i class="material-symbols-outlined text-black">{{ sidebarIcon }}</i>
  </div>

  <!-- Modal Change Password -->
  <div
    v-if="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
  >
    <div
      class="modal-backdrop fixed inset-0 bg-black opacity-50"
      @click="modalToggle"
    ></div>
    <v-card
      class="bg-green-100 flex flex-col items-center rounded p-4 w-fit text-nowrap h-fit"
    >
      <v-card-text>
        <Form
          :validation-schema="validationSchema"
          @submit="changePasswordHandler"
        >
          <div class="mb-4">
            <Field name="newPassword" v-slot="{ field, meta }">
              <v-text-field
                v-bind="field"
                label="New Password"
                type="password"
                :error-messages="meta.touched ? meta.errors : []"
              />
            </Field>
          </div>
          <div class="mb-4">
            <Field name="confirmPassword" v-slot="{ field, meta }">
              <v-text-field
                v-bind="field"
                label="Confirm Password"
                type="password"
                :error-messages="meta.touched ? meta.errors : []"
              />
            </Field>
          </div>
          <div class="flex flex-col gap-4">
            <v-btn type="submit" class="bg-green-500 text-white w-64 mb-4">
              Change Password
            </v-btn>
            <v-btn @click="modalToggle" class="bg-red-500 text-white w-64 mb-4">
              Cancel
            </v-btn>
          </div>
        </Form>
      </v-card-text>
    </v-card>
  </div>
</template>

<style></style>
