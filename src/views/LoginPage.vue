<script>
import { useAuthStore } from "@/stores/auth";
import { mapActions } from "pinia";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
export default {
  data() {
    return {
      validationSchema: yup.object({
        username: yup.string().required("Username is required"),
        password: yup.string().required("Password is required"),
      }),
    };
  },
  components: {
    Form,
    Field,
  },
  methods: {
    ...mapActions(useAuthStore, ["login"]),

    togglePasswordVisibility() {
      this.visible = !this.visible;
    },

    async loginHandler(values) {
      try {
        const res = await this.login(values);

        if (res.status === 200) {
          // Check for successful response
          localStorage.setItem("accessToken", res.data.data.accessToken);
          localStorage.setItem("role", res.data.data.role);

          this.$toast.success(`Logged in successfully`);
          this.$router.push("/trip");
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
  <div>
    <v-img
      class="mx-auto my-6"
      max-width="228"
      src="https://www.moda-holding.com/wp-content/uploads/2020/03/cropped-MODA-Holding-300x61-1.png"
    ></v-img>

    <v-card
      class="mx-auto pa-12 pb-18"
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <!-- Form with VeeValidate -->
      <Form
        :validation-schema="validationSchema"
        @submit="loginHandler"
        class="flex flex-col gap-4"
      >
        <!-- Username Field -->

        <Field name="username" v-slot="{ field, meta }">
          <v-text-field
            v-bind="field"
            label="Username"
            density="compact"
            placeholder="Enter your username"
            variant="outlined"
            :error-messages="meta.touched ? meta.errors : []"
          ></v-text-field>
        </Field>

        <!-- Password Field -->

        <Field name="password" v-slot="{ field, meta }">
          <v-text-field
            v-bind="field"
            label="Password"
            density="compact"
            placeholder="Enter your password"
            variant="outlined"
            type="password"
            @click:append-inner="visible = !visible"
            :error-messages="meta.touched ? meta.errors : []"
          >
          </v-text-field>
        </Field>

        <!-- Submit Button -->
        <v-btn
          type="submit"
          class="mb-4"
          color="green"
          size="large"
          variant="tonal"
          block
        >
          Log In
        </v-btn>
      </Form>
    </v-card>
  </div>
</template>
