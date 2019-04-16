<template>
  <div>
    <h1 class="title is-2" id="assignment">Loading...</h1>
            <h2 class="subtitle is-4" id="subject">Loading...</h2>
            <p class="box subtitle" id="description">Loading...</p>
            <p class="box subtitle">Deadline: {{getDeadline()}}</p>
            <div class="container center is-medium">
                <div class="file has-name">
                    <label class="file-label">
                        <input class="file-input" type="file" id="solution">
                        <span class="file-cta">
                            <span class="file-icon">
                                <i class="fas fa-upload"></i>
                            </span>
                            <span class="file-label" id="filename">
                                Choose a file…
                            </span>
                        </span>
                        <input class="button is-outlined" type="submit" id="uploadButton" onclick="uploadFile()" value="Submit">
                    </label>
                </div>
          </div>

            <div class="field" v-if="assignment !== null">
                <label class="label">Uploaded</label>
                <div class="control">
                <input v-model="assignment" id="uploadedAssignment" class="input is-static" type="text" readonly>
                </div>
            </div>
        <br>
            <a class="button is-warning" v-if="isAssignmentEnded" v-bind:href="linkz">Review</a>
  </div>
</template>

<script>

  import firebase from 'firebase';
    var url_string = window.location.href
    var url = new URL(url_string);
    var searchId = url.searchParams.get("id");

    let subject; // Title of subject assignment belongs to
    let name; // Title of the assignment
    let description; // Description of the assignment
  


export default {
  data : function () {
    return {
      message : "",
      user: null,
    assignment: null,
    linkz: "",
    userId: null,
    deadline: null,
    isAssignmentEnded: false
    }
  },
  methods: {
      getDeadline: function()
            {
                var date = new Date();
                date.setTime(this.deadline);
                parsedDate = date.toString().split(' ');
                return parsedDate[0] + ' ' + parsedDate[1] + ' ' + parsedDate[2] + ' ' + parsedDate[3] + ' ' + parsedDate[4];
            }
  },
  created () {
    db.collection("users").get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
          // doc.data() is never undefined for query doc snapshots
          this.$store.state.accounts.push(doc.data());
          this.$store.state.accounts[this.$store.state.accounts.length-1].id = doc.id;
      });
  });
  },
  mounted: () => {
            let userId; // Id of user entered the page

            // Automatic signing-in into the system
            firebase.auth().onAuthStateChanged(function (user) {
                app.user = user;
                if (user) {
                    userId = user.uid; 
                    app.userId = userId;
                } else {
                    window.location.href = "login";
                }
            });

        
            let db = firebase.firestore();
            let url_string = window.location.href
            let url = new URL(url_string);
            let searchId = url.searchParams.get("id");

            firebase.firestore().collection("assignments").doc(searchId).collection("users").get() 
            .then(snapshot => {
                snapshot.docs.forEach(doc => {
                    if (doc.id === userId) {
                        let path = doc.data().reference;
                        let parsedPath = path.split('/');
                        app.assignment = parsedPath[parsedPath.length - 1];
                    }
                });
            });
        }
}
    

    db.collection("assignments").doc(searchId).get()
        .then(snapshot => {
            if (snapshot.data()) {
                // the assignment with specified ID exists
                subject = snapshot.data().subject;
                name = snapshot.data().name;
                description = snapshot.data().description;

                // Set page details according to assingment
                document.title = subject + " " + name;
                document.getElementById('subject').innerHTML = subject;
                document.getElementById('assignment').innerHTML = name;
                document.getElementById('description').innerHTML = description;
                app.linkz = "review?id=" + searchId;
                app.deadline = snapshot.data().deadline;
                app.isAssignmentEnded = (app.deadline <= new Date().getTime());
            }
            else {
                // the assignment with specified ID does not exist
                window.location.replace(window.location.origin + "/404");
            }
        });    

    let file = document.getElementById("solution");
    file.onchange = function() {
        if (file.files.length > 0) {
            document.getElementById("filename").innerHTML = file.files[0].name;
        }
    }
    

    // uploading the files into the firebase database
    function uploadFile() {
        if (file.files.length) {
            let selectedFile = file.files[0];

            let storageRef = firebase.storage().ref();
            let subjectRef = storageRef.child(searchId);
            let objectRef = subjectRef.child(selectedFile.name);

            let metadata = {
                customMetadata: {
                    "author": app.userId
                }
            };

            var db = firebase.firestore();
            var docRef = db.collection("assignments").doc(searchId).collection("users").doc(app.userId)
            docRef.get().then(function(doc) {
                if (doc.exists) {
                    var storage = firebase.storage();
                    var storageReference = storage.ref(doc.data().reference);
                    
                    docRef.update({
                        reference: objectRef.fullPath
                    }).then(function()
                    {
                        storageReference.delete().catch(function(error) {
                        console.log("Error: ", error);
                        // Uh-oh, an error occurred!
                        });
                    }).catch(function(error) {
                        console.error("Error adding document: ", error);
                    });
                } else {
                    // doc.data() will be undefined in this case
                    docRef.set({
                        reference: objectRef.fullPath
                    }).catch(function(error) {
                        console.error("Error adding document: ", error);
                    });
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });

            objectRef.put(selectedFile, metadata)
                .then(() => {
                    // Cleaning the box off the name of uploaded file
                    document.getElementById("filename").innerHTML = "Choose a file…";
                });
        };
    }

</script>
