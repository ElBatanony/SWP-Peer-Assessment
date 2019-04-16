<template>
  <div>
      
    <h1 class="heading">Review assessment</h1>
    <div v-for="(field, index) in fieldsArr" v-bind:key="index">
        <v-text-field v-bind:label="field.name" v-model="field.value" readonly ></v-text-field>
    </div>

    <v-btn class="error" @click="deleteReview">Disapprove</v-btn>

  </div>    
</template>

<script>
import { mapState, mapGetters } from "vuex";
import axios from 'axios';

var app;

export default {
    data : function () {
        return {
            fieldsArr : []
        }
    },
  computed: {
    ...mapGetters(['isAdmin']),
    ...mapState([
    'user','userDetails','assignments','db','storage'
    ])
  },
  created() {
    this.assessmentId = this.$route.params.assessmentId;
    app = this

    this.db.collection("assessments").doc(this.assessmentId).get().then(snapshot => {
        if (snapshot.data()) {
            app.fieldsArr = snapshot.data().fields;
            app.userId = snapshot.data().userId;
            app.assignmentId = snapshot.data().assignmentId;
        } else {
            window.location.replace(window.location.origin + "/404");
        }
    });

  },
  methods: {
    deleteReview() {
            this.db.collection("assessments").doc(this.assessmentId).delete().then(function () {
                console.log("Review successfully deleted!");
            }).catch(function (error) {
                console.error("Error removing review: ", error);
            });

            this.db.collection("assignments").doc(app.assignmentId).collection("users").doc(app.userId).collection("reviews").doc(this.assessmentId).delete().then(function () {
                console.log("Review successfully deleted!");
            }).catch(function (error) {
                console.error("Error removing review: ", error);
            });
    }
  }
};

</script>
