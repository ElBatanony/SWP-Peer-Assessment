<template>
  <div>
    <div v-if="assignment">
      <span class="headline">{{ assignment.name }}</span>
      <v-chip color="green lighten-1">{{ assignment.course }}</v-chip>
      <v-chip color="green lighten-1">{{ assignment.subject }}</v-chip>
      <p>{{ assignment.description }}</p>
      <p class="subheading">Deadline: {{ new Date(assignment.deadline) }}</p>
    </div>

    <input
      style="display: none"
      type="file"
      @change="onFileSelected"
      ref="fileInput"
    />

    <div v-if="uploadedSubmission">
      <p>File uploaded: {{uploadedSubmission.fileName}}</p>
      <v-btn @click="downloadSubmission" class="success">Download Submission</v-btn>  
    </div>

    <v-btn @click="$refs.fileInput.click()" class="info">Choose File</v-btn>
    <v-btn @click="uploadFile" class="info">Upload File</v-btn>

    <br />
    <div v-if="selectedFile">File selected: {{ selectedFile.name }}</div>

    <v-btn to="/" class="warning">Assess other students' work</v-btn>

    <div v-if="assessments.length > 0">
      <div>
        <br>
        <h1>Assessments</h1>
        <div v-for="(field, index) in assessments[assessmentsPage-1].fields" v-bind:key="index">
          <br>
          <p>{{field.name}}</p>
          <p>{{field.description}}</p>
          <v-text-field label="Field type" v-if="field.type == 'Text'" v-model="field.type" readonly></v-text-field>
          <v-textarea v-else label="Review" v-model="field.value" readonly></v-textarea>
        </div>
      </div>
      <v-pagination v-model="assessmentsPage" :length="assessments.length" :total-visible=10></v-pagination>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
import { mapState, mapGetters } from "vuex";
import { constants } from 'crypto';
import axios from "axios";

var db = firebase.firestore();
var storageRef = firebase.storage().ref();
var app;

export default {
  data: function() {
    return {
      assignment: null,
      linkz: "",
      deadline: null,
      isAssignmentEnded: false,
      selectedFile: null,
      uploadedSubmission: null,
      assessments: [],
      assessmentsPage: 1
    };
  },
  methods: {
    uploadFile() {
      let metadata = {
        customMetadata: {
          author: this.user.uid,
          fileName: this.selectedFile.name
        }
      };

      var uploadTask = storageRef
        .child(`uploadedFiles/${this.assignment.id}/${this.user.uid}`)
        .put(this.selectedFile, metadata);

      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        function(snapshot) {},
        function(error) {
          console.log(error);
        },
        function() {
          // Upload completed successfully, now we can get the download URL
          uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            console.log("File available at", downloadURL);
            db.collection("submissions")
              .doc(app.assignment.id + "-" + app.user.uid)
              .set({
                assignmentId: app.assignment.id,
                username: app.user.displayName,
                fileName: app.selectedFile.name,
                userId: app.user.uid,
                downloadURL
              })
              .then(function() {
                console.log("Document successfully written!");
                app.assignment.fileName = app.selectedFile.name;
                app.assignment.downloadURL = downloadURL;
                app.uploadedSubmission = app.assignment;
                app.selectedFile = null;
              })
              .catch(function(error) {
                console.error("Error writing document: ", error);
              });
          });
        }
      );

      return;
    },

    downloadSubmission() {
      console.log(app.uploadedSubmission.downloadURL);
      axios({
        url: app.uploadedSubmission.downloadURL,
        method: "GET",
        responseType: "blob" // important
      })
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", this.uploadedSubmission.fileName);
          document.body.appendChild(link);
          link.click();
        })
        .catch(function(error) {
          console.log("Error download document:", error);
        });
    },
    onFileSelected(event) {
      this.selectedFile = event.target.files[0];
    }
  },
  created() {
    app = this;
  },
  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapState(["user", "userDetails", "assignments", "db"])
  },
  mounted: () => {
    let searchId = app.$route.params.assignmentId;
    let router = app.$router;
    var url_string = window.location.href;
    var url = new URL(url_string);
    var codeError = url.searchParams.get("errorCode");

    if (codeError === 1) {
      console.log("Assignment don't finished yet");
    } else if (codeError === 2) {
      console.log("All works are checked");
    } else if (codeError === 3) {
      console.log("No submit");
    }

    app.assignment = app.assignments.filter(x => x.id == searchId)[0];
    if (app.assignment == null) {
      console.log("No such assignment!");
      router.push("/assignments");
      return;
    }

    app.uploadedSubmission = app.assignment;

    app.db.collection("assessments").where(
      "submissionId", "==", app.assignment.id + '-' + app.user.uid).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          app.assessments.push(doc.data());
        });
      });
  }
};
</script>
