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
    <v-btn @click="$refs.fileInput.click()" class="info">Choose File</v-btn>
    <v-btn @click="uploadFile" class="info">Upload File</v-btn>

    <br />
    <div v-if="selectedFile">File selected: {{ selectedFile.name }}</div>
    <div v-if="selectedFile">File selected: {{ selectedFile.name }}</div>
    <v-btn @click="review" class="info">Assess other students' work</v-btn>
    </div>
</template>

<script>
  import firebase from "firebase";
  import {mapGetters, mapState} from "vuex";

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
      uploadedSubmission: null
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
              })
              .catch(function(error) {
                console.error("Error writing document: ", error);
              });
          });
        }
      );


    },
    review() {
      let router = app.$router;
      router.push("/review/" + this.assignment.id);
    },
    onFileSelected(event) {
      this.selectedFile = event.target.files[0];
    },
    downloadSubmission() {}
  },
  created() {
    app = this;
  },
  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapState(["user", "userDetails", "assignments"])
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
      //router.push("/assignments");

    }
  }
};
</script>
