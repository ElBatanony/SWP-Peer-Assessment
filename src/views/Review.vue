<template>
  <div>
    <div v-if="assignment">
        <h1 class="title is-2">{{assignment.name}}</h1>
        <h2 class="subtitle is-4">{{assignment.subject}}</h2>
        <p class="box subtitle">{{assignment.description}}</p>

        <p v-if="errors.length"><b>Please correct the following error(s):</b>
      <ul>
          <li v-for="error in errors" :key="error">{{error}}</li>
      </ul>
      </p>

      <v-btn @click="downloadWork" class="info">Download the submission</v-btn>

      <br><br>

      <div v-bind:key="index" v-for="(field, index) in assignment.reviewFields">
        <v-text-field :placeholder="field.description" outline v-if="field.type === 'Text'" :label="field.name" v-model="assignment.reviewFields[index].value"></v-text-field>
        <v-textarea :placeholder="field.description" outline v-if="field.type === 'Multiline text'" :label="field.name" v-model="assignment.reviewFields[index].value"></v-textarea>
      </div>
      
      <div class="text-xs-right">
        <v-btn @click="checkForm" class="warning">Finish review</v-btn>
        </div>
    </div>
    
      
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
        done: [],
        searchId: "",
        errors: [],
        submissionId: "",
        link: "",
        filename: "",
        userId: "",
        username: "",
        assignment: null
    };
  },
  created() {
    app = this;
  },
    methods: {
        checkForm: function () {
            this.errors = [];
            for (let i = 0; i < app.assignment.reviewFields.length; i++) {
                if (!app.assignment.reviewFields[i].value) {
                    this.errors.push('Field ' + app.assignment.reviewFields[i].name + " is empty!");
                }
            }
            if (this.errors.length === 0) {
                this.submitAssessment();
            }
        },
        submitAssessment: function () {
            db.collection("assessments").add({
                fields: app.assignment.reviewFields,
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
            for (let i = 0; i < app.reviewFields.length; i++) {
                app.reviewFields[i].value = "";
            }
            this.getWorkWrapper();
            alert("Review has been submitted")

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
                let router = app.$router;
                if (result.data.message === "Assignment don't finished yet") {
                    app.ref = "";
                    app.linkz = "";
                    router.push("/assignments/" + app.searchId);
                    alert("Assignment hasn't finished yet (deadline)");
                    //window.location.href = "/assignments/" + app.searchId + "?error=" + 1;
                } else if (result.data.message === "All works are checked") {
                    app.ref = "";
                    app.linkz = "";
                    router.push("/assignments/" + app.searchId);
                    alert("All works are checked! You've finished!");
                    //window.location.href = "/assignments/" + app.searchId + "?error=" + 2;
                } else if (result.data.message === "No submit") {
                    app.ref = "";
                    app.linkz = "";
                    router.push("/assignments/" + app.searchId);
                    alert("You need to submit your work before reviewing others")
                    //window.location.href = "/assignments/" + app.searchId + "?error=" + 3;
                } else {
                    // `url` is the download URL for 'images/stars.jpg'
                    // This can be downloaded directly:
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
    let searchId = app.$route.params.assignmentId;
    let router = app.$router;
    app.assignment = app.assignments.filter(x => x.id == searchId)[0];
    if (app.assignment == null) {
      console.log("No such assignment!");
      router.push("/assignments");
      return;
    }
  }
};
</script>
