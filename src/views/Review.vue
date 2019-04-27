<template>
  <div>
      <h1 class="title is-2" id="assignment">Loading...</h1>
            <h2 class="subtitle is-4" id="subject">Loading...</h2>
            <p class="box subtitle" id="description">Loading...</p>
            <a id="downloadLink" class="button is-success" v-bind:href="linkz" target="_blank">Download</a>
            <a class="button is-warning" onclick="nextWork()">Finish review</a>
  </div>    
</template>

<script>
import firebase from "firebase";
let db = firebase.firestore();

export default {
  data: function() {
    return {
       user: null,
            linkz: "",
            done: [],
            searchId: ""
    };
  },
  
  created() {
   let userId; // Id of user entered the page

    // Automatic signing-in into the system
    firebase.auth().onAuthStateChanged(function (user) {
        app.user = user;
        if (user) {
            userId = user.uid; 
        } else {
            window.location.href = "login";
        }
    });

    let db = firebase.firestore();
    var url_string = window.location.href
    var url = new URL(url_string);
    var searchId = url.searchParams.get("id");

    let subject; // Title of subject assignment belongs to
    let name; // Title of the assignment
    let description; // Description of the assignment

    db.collection("assignments").doc(searchId).get()
        .then(snapshot => {
            if (snapshot.data()) {
                // the assignment with specified ID exists
                subject = snapshot.data().subject;
                name = snapshot.data().name;
                description = snapshot.data().description;
                done = snapshot.data().done;

                // Set page details according to assingment
                document.title = subject + " " + name;
                document.getElementById('subject').innerHTML = subject;
                document.getElementById('assignment').innerHTML = name;
                document.getElementById('description').innerHTML = description;

                app.searchId = searchId;
                getWorkWrapper();
            }
            else {
                // the assignment with specified ID does not exist
                window.location.replace(window.location.origin + "/404");
            }
        });
    

    function getWorkWrapper()
    {
        var getWork = firebase.functions().httpsCallable('getWork');
        getWork({assignmentID: app.searchId}).then(function(result) {
            if(result.data.message === "Assignment don't finished yet")
            {
                app.ref = "";
                app.linkz = "";
                window.location.href = "/assignments/" + app.searchId + "?error=" + 1;
            }
            else if (result.data.message === "All works are checked")
            {
                app.ref = "";
                app.linkz = "";
                window.location.href = "/assignments/" + app.searchId + "?error=" + 2;
            }
            else if (result.data.message === "No submit")
            {
                app.ref = "";
                app.linkz = "";
                window.location.href = "/assignments/" + app.searchId + "?error=" + 3;
            }
            else
            {
                // `url` is the download URL for 'images/stars.jpg'
                // This can be downloaded directly:
                var a = document.getElementById("downloadLink");
                a.download = result.data.filename;
                app.linkz = result.data.message;
            }
        });
    }

    function nextWork()
    {
        console.log("TODO submit assessment");
        console.log("call getWorkWrapper")
    } 
  }
};
</script>
