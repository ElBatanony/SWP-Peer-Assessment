<template>
  <div>
    <h1 class="title is-2" id="assignment">Loading...</h1>
    <h2 class="subtitle is-4" id="subject">Loading...</h2>
    <p class="box subtitle" id="description">Loading...</p>
      <p v-if="errors.length"><b>Please correct the following error(s):</b>
      <ul>
          <li v-for="error in errors">{{error}}</li>
      </ul>
      </p>
      <div v-bind:key="index" v-for="(field, index) in reviewFields">
          <h1 class="title is-2">{{field.name}}</h1>
          <div v-if="field.type === 'Text'">
              <v-text-field v-bind:label="field.description" v-model="reviewFields[index].value"></v-text-field>
          </div>
          <div v-if="field.type === 'Multiline text'">
              <v-textarea v-bind:label="field.description" v-model="reviewFields[index].value"></v-textarea>
          </div>
      </div>
      <v-btn @click="downloadWork">Download</v-btn>
      <v-btn @click="checkForm">Finish review</v-btn>
  </div>
</template>

<script>
    import firebase from "firebase";
    import {mapGetters, mapState} from "vuex";
    import axios from "axios";

    var db = firebase.firestore();
var app;

export default {
  data: function() {
    return {
      user: null,
      done: [],
        searchId: "",
        reviewFields: [],
        errors: [],
        submissionId: "",
        link: "",
        filename: "",
        userId: "",
        username: ""
    };
  },
  created() {
    app = this;
  },
    methods: {
        checkForm: function () {
            this.errors = [];
            for (let i = 0; i < app.reviewFields.length; i++) {
                if (!app.reviewFields[i].value) {
                    this.errors.push('Field ' + app.reviewFields[i].name + " is empty!");
                }
            }
            if (this.errors.length === 0) {
                this.submitAssessment();
            }
        },
        submitAssessment: function () {
            let db = firebase.firestore();
            db.collection("assessments").add({
                fields: app.reviewFields,
                assignmentId: app.searchId,
                submissionId: app.submissionId,
                userId: app.userId,
                username: app.username
            })
                .then(function (docRef) {
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                });
            this.getWorkWrapper();
        },
        downloadWork: function () {
            axios({
                url: app.link,
                method: "GET",
                responseType: "blob" // important
            })
                .then(response => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", app.filename);
                    document.body.appendChild(link);
                    link.click();
                })
                .catch(function (error) {
                    console.log("Error download document:", error);
                });
        },
        getWorkWrapper: function () {
            var getWork = firebase.functions().httpsCallable("getWork");
            getWork({assignmentID: app.searchId}).then(function (result) {
                if (result.data.message === "Assignment don't finished yet") {
                    app.ref = "";
                    app.linkz = "";
                    window.location.href = "/assignments/" + app.searchId + "?error=" + 1;
                } else if (result.data.message === "All works are checked") {
                    app.ref = "";
                    app.linkz = "";
                    window.location.href = "/assignments/" + app.searchId + "?error=" + 2;
                } else if (result.data.message === "No submit") {
                    app.ref = "";
                    app.linkz = "";
                    window.location.href = "/assignments/" + app.searchId + "?error=" + 3;
                } else {
                    // `url` is the download URL for 'images/stars.jpg'
                    // This can be downloaded directly:
                    console.log(result);
                    app.filename = result.data.filename;
                    app.link = result.data.message;
                    app.submissionId = result.data.submissionId;
                }
            });
        }
    },
  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapState(["user", "userDetails", "assignments"])
  },
    mounted() {
        let db = firebase.firestore();
        this.db = db;
    let searchId = app.$route.params.assignmentId;
    let router = app.$router;
        firebase.auth().onAuthStateChanged(user => {
            app.user = user;
            if (user) {
                db.collection("users").doc(user.uid).get()
                    .then(doc => {
                        if (doc.exists) {
                            app.userDetails = doc.data();
                            app.userId = user.uid;
                            app.username = app.userDetails.name;
                        } else {
                            // doc.data() will be undefined in this case
                            console.log("No such document");
                        }
                    }).catch(erorr => {
                    console.log("Error getting document: ", error);
                });
            } else {
                // User is signed out
                window.location.href = "login";
            }
        });
    app.assignment = app.assignments.filter(x => x.id == searchId)[0];
    if (app.assignment == null) {
      console.log("No such assignment!");
      router.push("/assignments");
      return;
    }

    let subject; // Title of subject assignment belongs to
    let name; // Title of the assignment
    let description; // Description of the assignment

    db.collection("assignments")
      .doc(searchId)
      .get()
      .then(snapshot => {
        if (snapshot.data()) {
          // the assignment with specified ID exists
          subject = snapshot.data().subject;
          name = snapshot.data().name;
          description = snapshot.data().description;
            app.reviewFields = snapshot.data().reviewFields;

          // Set page details according to assingment
          document.title = subject + " " + name;
          document.getElementById("subject").innerHTML = subject;
          document.getElementById("assignment").innerHTML = name;
          document.getElementById("description").innerHTML = description;

          app.searchId = searchId;
            this.getWorkWrapper();
        } else {
          // the assignment with specified ID does not exist
          window.location.replace(window.location.origin + "/404");
        }
      });
  }
};
</script>
