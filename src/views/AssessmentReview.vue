<template>
  <div>
    
    <v-layout justify-center>
      <v-flex xs12 sm10 md8 lg6>
        <v-card ref="form">
          <v-toolbar color="success" dark>
            <v-toolbar-title v-if="userName">{{userName}} submission</v-toolbar-title>
          </v-toolbar>

          <!-- <v-list three-line>
            <template v-for="(field, index) in fieldsArr">
              <v-divider :key="index"></v-divider>
              <v-list-item :key="field.name+field.description">
                <v-list-item-content>
                  <v-list-item-title>{{field.name}}</v-list-item-title>
                  <v-list-item-subtitle></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list> -->
          <v-card-text>
            <div v-for="(field, index) in fieldsArr" v-bind:key="index">
              <v-text-field v-if="field.type=='Text'" v-bind:label="field.name" v-model="field.value" readonly></v-text-field>
              <v-textarea v-else v-bind:label="field.name" v-model="field.value" readonly></v-textarea>
              <br>
            </div>
          </v-card-text>
          <v-divider class="mt-5"></v-divider>
          <v-card-actions>
            <v-btn flat @click="$router.push('/assessments/' + getSubmissionId())">Go back</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="error" flat @click="deleteReview">Disapprove</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import axios from 'axios';

var app;

export default {
    data : function () {
        return {
            fieldsArr : [],
            userName: null,
            submissionId: null
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
            app.userName = snapshot.data().username;
            app.submissionId = snapshot.data().submissionId;
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
    },
    getSubmissionId() {
      let id = app.submissionId.split("-");
      return(id[0] + '/' + id[1]);
    }
  }
};

</script>
