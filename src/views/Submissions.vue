<template>
  <div>
    <div v-if="assignment">
        <h1 class="heading" :value="assignment.name">Loading...</h1>
        <h2 class="subheading" value="assignment.subject">Loading...</h2>
        <p class="subtitle" value="assignment.description">Loading...</p>
    </div>
    
    <h3 class="subtitle">List of submissions</h3>
    <div id="submissions"></div>
  </div>    
</template>

<script>
import { mapState, mapGetters } from "vuex";

var app;

export default {
    data: function () {
        return {
            submissions: []
        }
    },
  computed: {
    ...mapGetters(['isAdmin']),
    ...mapState([
    'user','userDetails','assignments','db'
    ])
  },
  created() {
      this.assignment = null
  },
  mounted() {
    app = this;
    this.assignmentId = this.$route.params.assignmentId;
    this.assignment = this.assignments.filter( x => x.id == this.assignmentId )[0];

    console.log( this.$route.params.assignmentId, this.assignment )

    if (!this.assignment) {
        console.log('no assignment')
        return
    }

    var codeError = this.$route.params.errorCode;

    if (codeError) {
        text = document.getElementById("errMessage");
        if (codeError === "1") {
            text.innerText = "Assignment don't finished yet";
        } else if (codeError === "2") {
            app.linkz = "";
            text.innerText = "All works are checked";
        } else if (codeError === "3") {

            text.innerText = "No submit";
        }
    }    

    this.GetReviews();
  },
  methods: {
      GetReviews(){
        var subm = document.getElementById("submissions");
        app.db.collection("assignments").doc(app.assignmentId).collection("users").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                app.db.collection("users").doc(doc.id).get().then(function(docU) {
                    if (docU.exists) {
                        subm.innerHTML += `<a href="/assessments/${app.assignmentId}/${doc.id}">Work by ${docU.data().name}</a><br>`
                        //subm.innerHTML += "<a href='/assessmentsList?assignmentId=" + searchId + "&userId=" + doc.id + "'>Work by " + docU.data().name + "</a><br>"
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                        subm.innerHTML += `<a href="/assessments/${app.assignmentId}/${doc.id}">Work by anonymous</a><br>`
                        //subm.innerHTML += "<a href='/assessmentsList?assignmentId=" + searchId + "&userId=" + doc.id + "'>Work by anonymous</a><br>"
                    }
                }).catch(function(error) {
                    console.log("Error getting document:", error);
                });
            });
        });
      }
  }
};

/*
    getDeadline: function () {
        var date = new Date();
        date.setTime(this.deadline);
        parsedDate = date.toString().split(' ');
        return parsedDate[0] + ' ' + parsedDate[1] + ' ' + parsedDate[2] + ' ' + parsedDate[3] + ' ' + parsedDate[4];
    }
*/
</script>
