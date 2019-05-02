<template>
  <div>
    
    <v-layout row>
    <v-flex >
      <v-card class="mb-2">
         <v-toolbar color="success" dark>
          <v-toolbar-title>{{assignment.name}} submissions</v-toolbar-title>
        </v-toolbar>

        <v-list two-line>
          <template v-for="(submission, index) in submissions">
            <v-list-tile :key="submission.userId" :to="`/assessments/'${submission.assignmentId}/${submission.userId}`" >

              <v-list-tile-content>
                <v-list-tile-title>{{ submission.username }}</v-list-tile-title>
                <v-list-tile-sub-title class="text--primary">{{ submission.fileName }}</v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action>
                <v-icon>arrow_forward</v-icon>
              </v-list-tile-action>

            </v-list-tile>
            <v-divider v-if="index + 1 < submissions.length" :key="index" ></v-divider>
          </template>
        </v-list>
      </v-card>
    </v-flex>

  </v-layout> 
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import firebase from "firebase";

var db = firebase.firestore();
var app;

export default {
  data: function() {
    return {
      submissions: [],
      assignment: null
    };
  },
  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapState(["user", "userDetails", "assignments"])
  },
  created() {
    app = this;
  },
  mounted() {
    this.assignmentId = this.$route.params.assignmentId;
    this.assignment = this.assignments.filter(
      x => x.id == this.assignmentId
    )[0];

    if (!this.assignment) {
      console.log("no assignment");
      this.$router.push("/assignments");
      return;
    }

    db.collection("submissions")
      .where("assignmentId", "==", this.assignmentId)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          app.submissions.push(doc.data());
        });
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  }
};
</script>
