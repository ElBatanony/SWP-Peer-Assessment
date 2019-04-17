<template>

  <div>

    <v-toolbar dark color="green lighten-1">

      <v-toolbar-title>Peer Assessment</v-toolbar-title>

      <v-toolbar-items>
        <v-btn flat to="/">Home</v-btn>
        <v-btn flat to="/assignments" v-if="user">Assignments</v-btn>
        <v-btn flat to="/users" v-if="userDetails.role == 'admin'">Users</v-btn>
      </v-toolbar-items>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn flat @click="signOut()" v-if="user != null">Sign out</v-btn>
        <v-btn flat to="/login" v-if="user == null">Sign in</v-btn>
      </v-toolbar-items>

    </v-toolbar>

  </div>
</template>

<script>
import firebase from "firebase";
import { mapState } from "vuex";

export default {
  name: "Navbar",
  computed: mapState([
    'user','userDetails'
  ]),
  methods: {
    signOut() {
      firebase.auth().signOut().then(
          function() {
            console.log("Signed Out");
            window.location = '/';
          },
          function(error) {
            console.error("Sign Out Error", error);
          }
        );
    }
  }
};
</script>