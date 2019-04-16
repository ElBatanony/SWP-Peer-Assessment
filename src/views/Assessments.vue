<template>
  <div>
      
    <h1 class="subtitle is-2" v-if="user">Work of {{user.displayName}}</h1>
    <v-btn id="downloadLink" class="success" @click="downloadWork" target="_blank">Download the work</v-btn>

    <p>Reviews</p>
    <div id="reviews"></div>
  </div>    
</template>

<script>
import { mapState, mapGetters } from "vuex";
import axios from 'axios';

export default {
  computed: {
    ...mapGetters(['isAdmin']),
    ...mapState([
    'user','userDetails','assignments','db','storage'
    ])
  },
  created() {
    this.assignmentId = this.$route.params.assignmentId;
    this.userId = this.$route.params.userId;
    this.assignment = this.assignments.filter( x => x.id == this.assignmentId )[0];

    let storage = this.storage
    let app = this;

    this.db.collection("assignments").doc(this.assignmentId).collection("users").doc(this.userId).get().then(function(doc) {
    if (doc.exists) {
        var fileRef = storage.ref(doc.data().reference);
        fileRef.getDownloadURL().then(function(url) {
            app.fname = fileRef.name;
            app.linkz = url;
        console.log('got file')
        }).catch(function(error) {
        });
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

    let db = this.db
    this.db.collection("assignments").doc(this.assignmentId).collection("users").doc(this.userId).collection("reviews").get().then(function(querySnapshot) {
        var subm = document.getElementById("reviews");
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            var ref = db.collection("users").doc( "" + doc.data().author);
            ref.get().then(function(docU) {
                if (docU.exists) {
                    //subm.innerHTML += "<a href='/assessmentReview?assessmentId=" + doc.id + "'>Review by " + docU.data().name + "</a><br>"
                    subm.innerHTML += "<a href='/assessments/" + doc.id + "'>Review by " + docU.data().name + "</a><br>"
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                    subm.innerHTML += "<a href='/assessmentsList?assignmentId=" + id + "&userId=" + doc.id + "'>Review by anonymous</a><br>"
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
        });
    });

  },
  methods: {
    downloadWork() {
        axios({
            url: this.linkz,
            method: 'GET',
            responseType: 'blob', // important
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', this.fname);
            document.body.appendChild(link);
            link.click();
        });
    }
  }
};
</script>
