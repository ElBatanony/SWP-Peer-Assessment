<template>
  <div>
    <div v-if="assignment">
      <h1 class="heading">{{ assignment.name }}</h1>
      <p class="subheading">{{ assignment.description }}</p>
    </div>

    <h3 class="subtitle">List of submissions</h3>
    <div v-for="submission in submissions" v-bind:key="submission.userId">
      {{ submission.userId }}
    </div>
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
