<template>
  <div>
    <v-layout row>
      <v-flex >
        <v-card class="mb-2">
          <v-toolbar color="success" dark>
            <v-toolbar-title v-if="submission">Assessments for {{submission.username}}</v-toolbar-title>
          </v-toolbar>

          <v-list two-line>
            <template v-for="(assessment, index) in assessments">
              <v-list-tile :key="assessment.userId" :to="`/assessments/${assessment.id}`" >

                <v-list-tile-content>
                  <v-list-tile-title>By {{ assessment.username }}</v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon>arrow_forward</v-icon>
                </v-list-tile-action>

              </v-list-tile>
              <v-divider v-if="index + 1 < assessments.length" :key="index" ></v-divider>
            </template>
          </v-list>
        </v-card>
        <v-layout class="justify-center" v-if="submission">
          <v-btn class="info" :href="fileurl" target="_blank" :download="(submission.fileName)">Download Submission</v-btn>
        </v-layout>
      </v-flex>
      
    </v-layout> 
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import firebase from 'firebase';

var db = firebase.firestore();
var storage = firebase.storage();
var app;

export default {
  data : function () {
    return {
      assignmentId: '',
      userId: '',
      assignment: null,
      submission: null,
      assessments: [],
      fileurl: ''
    }
  },
  computed: {
    ...mapState(["user", "userDetails", "assignments"])
  },
  created() {
    app = this;
    this.assignmentId = this.$route.params.assignmentId;
    this.userId = this.$route.params.userId;
    this.assignment = this.assignments.filter(
      x => x.id == this.assignmentId
    )[0];

    db
      .collection("submissions")
      .doc(this.assignmentId + "-" + this.userId)
      .get()
      .then(function(doc) {
        if (doc.exists) {
          app.submission = doc.data();

          axios({
            url: app.submission.downloadURL,
            method: "GET",
            responseType: "blob" // important
          })
          .then(response => {
            app.fileurl = window.URL.createObjectURL(new Blob([response.data]));
          })
          .catch(function(error) {
            console.log("Error download document:", error);
          });
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      })
      .catch(function(error) {
        console.log("Error getting document:", error);
      });

    db
      .collection("assessments")
      .where("submissionId", "==", this.assignmentId + "-" + this.userId)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          app.assessments.push( {
              id: doc.id,
              ...doc.data()
            });
        });
      })
      .catch(function(error) {
        console.log("Error getting document:", error);
      });
  }
};
</script>
