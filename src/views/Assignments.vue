<template>
  <div>
      
    <h1 class="headline">Assignments</h1>
    
    <div v-for="assignment in assignments" v-if="(assignment.course == userDetails.course || isAdmin)" v-bind:key="assignment.name">
        <span class="title">{{assignment.name}} </span>
        <v-chip color="info">{{assignment.course}}-{{assignment.subject}}</v-chip>
        <v-chip v-if="!isAdmin" v-bind:color="( (assignment.reviews||0) < (assignment.minreviews||0))? 'warning' : 'success'">{{assignment.reviews || 0}}/{{assignment.minreviews|| 0}} Reviews</v-chip>
        <v-chip color="success" v-if="!isAdmin && assignment.submitted">Submitted</v-chip>
        <v-chip color="error" v-if="!isAdmin && !assignment.submitted">Not Submitted</v-chip>

        <v-btn small :to="'/submissions/'+assignment.id" v-if="isAdmin" class="warning">View Submissions</v-btn>
        <v-btn small :to="'/assignments/edit/'+assignment.id" v-if="isAdmin" class="warning">Edit Assignment</v-btn>
        <v-btn small :to="'/assignments/'+assignment.id" v-if="!isAdmin" class="warning">View Assignment</v-btn>
    </div>

    <v-btn v-if="userDetails.role == 'admin'" class="info" v-on:click="createNewAssignment">Add Assignment</v-btn>
  </div>    
</template>

<script>
import firebase from 'firebase';
import { mapState, mapGetters } from "vuex";

var db = firebase.firestore();
var app;

export default {
  computed: {
    ...mapGetters(['isAdmin']),
    ...mapState([
    'user','userDetails','assignments'
    ])
  },
  created() {
    app = this;
  },
  methods: {
    createNewAssignment() {
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
