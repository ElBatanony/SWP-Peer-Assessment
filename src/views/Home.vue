<template>
  <div>
    <p class="headline text-xs-center">Welcome to the Peer Assessment software project!</p>

    <div v-if="user != null">
      <p class="headline text-xs-center" >Greetings, {{user.displayName}}!</p>
    </div>
    
    <div v-if="userDetails">
      <v-layout align-center justify-space-between row fill-height>
        <p class="headline" >Notifications</p>
        <v-btn color="info" @click="clearNotifications">Clear Notifications</v-btn>
      </v-layout>
    
      <div v-bind:key="notification" v-for="notification in userDetails.notifications">
        <v-alert value="true" type="warning"> {{notification}} </v-alert>
      </div>
    </div>

  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: mapState([
    'user','userDetails'
  ]),
  created() {
  },
  methods: {
    clearNotifications(x) {
      return this.$store.dispatch('clearNotifications', this.userDetails.uid )
    }
  }
};
</script>