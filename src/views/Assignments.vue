<template>
  <div>
      
    <h1 class="headline">Assignments</h1>
    
    <div v-for="assignment in assignments" v-if="(assignment.course == userDetails.course || isAdmin)" v-bind:key="assignment.name">
        <span class="title">{{assignment.name}} </span>
        <v-chip color="green lighten-1">{{assignment.course}}</v-chip>
        <v-chip color="green lighten-1">{{assignment.subject}}</v-chip>

        <v-btn small :to="'/submissions/'+assignment.id" v-if="isAdmin" class="warning">View Submissions</v-btn>
        <v-btn small :to="'/assignments/edit/'+assignment.id" v-if="userDetails.role == 'admin'" class="warning">Edit Assignment</v-btn>
        <v-btn small :to="'/assignments/'+assignment.id" v-if="userDetails.role != 'admin'" class="warning">View Assignment</v-btn>
    </div>

    <v-btn v-if="userDetails.role == 'admin'" class="info" v-on:click="createNewAssignment">Add Assignment</v-btn>
  </div>    
</template>

<script>
import firebase from 'firebase';
import { mapState, mapGetters } from "vuex";

let db = firebase.firestore();

export default {
  computed: {
    ...mapGetters(['isAdmin']),
    ...mapState([
    'user','userDetails','assignments'
    ])
  },
  methods: {
    createNewAssignment() {
      console.log('hi')
      db.collection("assignments").add({
          name: 'New Assignment ' + new Date().getMilliseconds(),
          description: 'New Assignment Description',
      })
      .then(function(docRef) {
          console.log("Document written with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
    }
  }
};
</script>
