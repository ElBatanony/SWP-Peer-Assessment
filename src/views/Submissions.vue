<template>
    <div>
        <div v-if="assignment">
            <h1 class="heading" >{{assignment.name}}</h1>
            <h2 class="subheading" >{{assignment.subject}}</h2>
            <p class="subtitle" >{{assignment.description}}</p>


            <h3 class="subtitle">List of submissions</h3>

            <div v-for="submission in submissions" v-if="(submission.assignmentId === assignment.id)"
                 v-bind:key="submission.id">
                <span class="title">Work by {{ submission.assignmentId}} </span>

                <v-btn small :to="'/assessments/'+ submission.assignmentId +'/' + submissions.userId" class="warning">View
                    Assessments
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState, mapGetters} from "vuex";

    var app;

    export default {

        computed: {
            ...mapGetters(['isAdmin']),
            ...mapState([
                'user', 'userDetails', 'assignments', 'db', 'submissions'
            ])
        },
        created() {
            this.assignment = null

        },
        mounted() {
            app = this;
            this.assignmentId = this.$route.params.assignmentId;
            this.assignment = this.assignments.filter(x => x.id === this.assignmentId)[0];
            if (!this.assignment) {
                console.log('no assignment')
                return
            }
            console.log(this.submissions)

            //this.GetReviews();
        }/*,
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
  }*/
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
