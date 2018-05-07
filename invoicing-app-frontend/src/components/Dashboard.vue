<template>
  <div class="container-fluid" style="padding: 0px;">
    <Header v-bind:user="user"/>
    <template v-if="this.isactive == 'create'">
      <CreateInvoice />
    </template>
    <template v-else>
    </template>
  </div>
</template>

<script>
import Header from "./Header";
import CreateInvoice from "./CreateInvoice";
export default {
  name: "Dashboard",
  components: {
    Header,
    CreateInvoice,
  },
  data() {
    return {
      isactive: 'create',
      title: "Invoicing App",
      user : (this.$route.params.user) ? this.$route.params.user : null
    };
  },
  mounted(){
    this.user = JSON.parse(localStorage.getItem("user"));
  }
};
</script>