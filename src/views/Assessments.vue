<template>
  <div>
    <h1 class="subtitle is-2" v-if="user">Work by {{ author }}</h1>
    <v-btn
      id="downloadLink"
      class="success"
      @click="downloadWork"
      target="_blank"
      >Download the work</v-btn
    >

    <p>Reviews</p>
    <div id="reviews"></div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import axios from "axios";

export default {
  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapState(["user", "userDetails", "assignments", "db", "storage"])
  },
  created() {
    this.assignmentId = this.$route.params.assignmentId;
    this.userId = this.$route.params.userId;
    this.assignment = this.assignments.filter(
      x => x.id == this.assignmentId
    )[0];
    this.author = "";
    this.link = "";
    this.filename = "";
    let storage = this.storage;
    let app = this;

    this.db
      .collection("submissions")
      .doc(this.assignmentId + "-" + this.userId)
      .get()
      .then(function(doc) {
        if (doc.exists) {
          app.author = doc.data().username;
          app.link = doc.data().downloadURL;
          app.filename = doc.data().fileName;
          console.log("got file");
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      })
      .catch(function(error) {
        console.log("Error getting document:", error);
      });

    this.db
      .collection("assessments")
      .where("submissionId", "==", this.assignmentId + "-" + this.userId)
      .get()
      .then(function(querySnapshot) {
        var subm = document.getElementById("reviews");
        querySnapshot.forEach(function(doc) {
          subm.innerHTML +=
            "<a href='/assessments/" +
            doc.id +
            "'>Review by " +
            doc.data().author +
            "</a><br>";
        });
      })
      .catch(function(error) {
        console.log("Error getting document:", error);
      });
  },
  methods: {
    downloadWork() {
      axios({
        url: this.link,
        method: "GET",
        responseType: "blob" // important
      })
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", this.filename);
          document.body.appendChild(link);
          link.click();
        })
        .catch(function(error) {
          console.log("Error download document:", error);
        });
    }
  }
};
</script>
