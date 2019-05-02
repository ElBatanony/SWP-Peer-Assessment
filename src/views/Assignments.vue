<template>
  <v-layout row>
    <v-flex >
      <v-card class="mb-2">
        <v-list two-line>
          <template v-for="(assignment, index) in assignments">
            <v-list-tile :key="assignment.id" :to="'/assignments/'+ (isAdmin?'edit/':'') + assignment.id" >

              <v-list-tile-content>
                <v-list-tile-title>{{ assignment.name }}</v-list-tile-title>
                <v-list-tile-sub-title class="text--primary">{{ assignment.course }} {{ assignment.subject }}</v-list-tile-sub-title>
                <div v-if="!isAdmin">
                  <v-list-tile-sub-title v-if="assignment.submitted"> <span class="success--text">Submitted</span> </v-list-tile-sub-title>
                  <v-list-tile-sub-title v-else> <span class="error--text">Not Submitted</span> </v-list-tile-sub-title>
                </div>
              </v-list-tile-content>

              <v-list-tile-action>
                <v-list-tile-action-text v-if="!isAdmin">{{assignment.reviews||0}}/{{assignment.minreviews||0}} reviewed</v-list-tile-action-text>
                <v-icon>arrow_forward</v-icon>
              </v-list-tile-action>

            </v-list-tile>
            <v-divider v-if="index + 1 < assignments.length" :key="index" ></v-divider>
          </template>
        </v-list>
      </v-card>
      <v-layout class="justify-center">
        <v-btn v-if="isAdmin" class="info" @click="createNewAssignment">Add Assignment</v-btn>
      </v-layout>
      
    </v-flex>

  </v-layout> 
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
