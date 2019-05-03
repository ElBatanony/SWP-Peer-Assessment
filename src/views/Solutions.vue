<template>
  <div>

    <input @change="onFileSelected" ref="fileInput" style="display: none" type="file"/>

    <v-layout>
        <v-flex xs12 sm6 offset-sm3>
        <v-card v-if="assignment">
            <v-card-title primary-title>
            <div>
                <h3 class="headline mb-0">{{assignment.name}}</h3>
                <div> {{ assignment.course }} - {{ assignment.subject }} </div>
                <p>Deadline: {{ new Date(assignment.deadline).toISOString().substr(0,10) }} - {{ new Date(assignment.deadline).toISOString().substr(11,5) }} </p>
                <p v-if="uploadedSubmission.submitted">
                    Uploaded file: {{uploadedSubmission.fileName}} 
                    <v-btn small @click="downloadSubmission" color="info" dark>Download
                        <v-icon dark right>cloud_download</v-icon>
                    </v-btn>
                </p>
            </div>
            </v-card-title>

            <v-card-text>
                <p class="subheading"> {{assignment.description}} </p>
                
                <div class="text-xs-center">
                    <v-btn color="success" @click="$refs.fileInput.click()">Upload new submission</v-btn>
                    <v-btn @click="review" color="warning">Assess other students' work</v-btn>
                </div>
                
            </v-card-text>

            <v-card-text v-if="assessments.length > 0">

                <v-divider class="mb-2"></v-divider>

                <h1 class="headline">Assessments</h1>
                <v-list two-line>
                <template v-for="(field, index) in assessments[assessmentsPage-1].fields">
                    <v-list-tile :key="field.name+field.value" >

                    <v-list-tile-content>
                        <v-list-tile-title>{{ field.name }}</v-list-tile-title>
                        <v-list-tile-sub-title class="text--primary">{{ field.value }}</v-list-tile-sub-title>
                    </v-list-tile-content>

                    </v-list-tile>
                    <v-divider v-if="index + 1 < assessments[assessmentsPage-1].fields.length" :key="index" ></v-divider>
                </template>
                </v-list>
                <v-pagination color="info" :length="assessments.length" :total-visible=10 v-model="assessmentsPage"></v-pagination>

            </v-card-text>

            

            <v-divider class="mt-2"></v-divider>

            <v-card-actions>
                <v-btn flat to="/">Go back</v-btn>
            </v-card-actions>
        </v-card>
        </v-flex>
    </v-layout>

    

  </div>
</template>

<script>
    import firebase from "firebase";
    import {mapGetters, mapState} from "vuex";
    import axios from "axios";

    var db = firebase.firestore();
    var storageRef = firebase.storage().ref();
    var app;

    export default {
        data: function () {
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
                    function (snapshot) {
                    },
                    function (error) {
                        console.log(error);
                    },
                    function () {
                        // Upload completed successfully, now we can get the download URL
                        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
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
                                .then(function () {
                                    console.log("Document successfully written!");
                                    app.assignment.fileName = app.selectedFile.name;
                                    app.assignment.downloadURL = downloadURL;
                                    app.uploadedSubmission = app.assignment;
                                    app.selectedFile = null;
                                })
                                .catch(function (error) {
                                    console.error("Error writing document: ", error);
                                });
                        });
                        alert('File successfuly uploaded!')
                        app.$router.push('/assignments')
                    }
                );


            },
            review() {
                let router = app.$router;
                router.push("/review/" + this.assignment.id);
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
                    .catch(function (error) {
                        console.log("Error download document:", error);
                    });
            },
            onFileSelected(event) {
                this.selectedFile = event.target.files[0];
                this.uploadFile();
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