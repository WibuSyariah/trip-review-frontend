<script>
import Sidebar from "@/components/Sidebar.vue";
export default {
  name: "AuthLayout",
  data() {
    return {};
  },
  computed: {},
  components: {
    Sidebar,
  },
};
</script>

<template>
  <div class="flex">
    <Sidebar></Sidebar>
    <RouterView></RouterView>
  </div>
</template>
