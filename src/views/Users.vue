<template>
  <div>
    <h1 class="heading">Users of the system</h1>

    <div v-for="account in accounts" v-bind:key="account.id">
      <span class="subheading">{{account.name}}</span>
      <v-chip v-if="account.course" color="green lighten-1">{{account.course}}</v-chip>
      <v-chip v-if="account.group" color="green lighten-1">{{account.group}}</v-chip>
      <v-btn small :to="'/users/'+account.id" v-if="isAdmin" class="warning">Edit</v-btn>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters(['isAdmin']),
    ...mapState([
    'accounts'
    ])
  }
}
</script>
