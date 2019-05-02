import Vue from "vue";
import './plugins/vuetify'
import firebase from 'firebase';
import firebaseui from 'firebaseui';
import App from "./App.vue";
import router from "./router";
import store from "./store";

import Navbar from '@/components/Navbar.vue';

import Vuetify from 'vuetify'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import { mapState } from 'vuex'


Vue.config.productionTip = false;

Vue.use(Vuetify)

let config = {
  apiKey: "AIzaSyBoFhrw9RehDmHHFgOV4aFi3TrBfT_PY48",
  authDomain: "swp-peer-assessment.firebaseapp.com",
  databaseURL: "https://swp-peer-assessment.firebaseio.com",
  projectId: "swp-peer-assessment",
  storageBucket: "swp-peer-assessment.appspot.com",
  messagingSenderId: "998218435509"
};

Vue.component('Navbar', Navbar);

let app = new Vue({
  router,
  store,
  render: h => h(App),
  computed: {
    isAdmin() {
      return app.$store.state.userDetails.role == 'admin'
    },
    ...mapState([
    'user','db','auth','storage','assignments'
    ])
  },
  beforeCreate() {
    firebase.initializeApp(config);
    this.db = firebase.firestore();
    this.storage = firebase.storage();
    this.auth = firebase.auth();
  },
  created () {
    
  },
  mounted() {
    this.$store.state.db = this.db;
    this.$store.state.storage = this.storage;
    this.$store.state.auth = this.auth;
    firebase.auth().onAuthStateChanged(function (user) {
      app.$store.state.user = user;
      if (user) {
        store.dispatch('bindUserDetails', user ).then(function () {
          let course = app.$store.state.userDetails.course;

          if (app.$store.state.userDetails.role == 'admin') {
            store.dispatch('bindAccounts')
            store.dispatch('bindCourses')
          }
          //console.log(app.$store.state.userDetails)
          if (app.$store.state.userDetails.role == 'admin') course = null;
          store.dispatch('bindAssignments', course).then( function() {
              app.db.collection('submissions').where("userId", "==", app.user.uid).get()
              .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                      // doc.data() is never undefined for query doc snapshots
                      //console.log(doc.id, " => ", doc.data());
                      app.assignments.filter(x => x.id == doc.data().assignmentId)[0].submitted = true;
                  });
              })
              .catch(function(error) {
                  console.log("Error getting documents: ", error);
              });

              app.db.collection('assessments').where("userId", "==", app.user.uid).get()
              .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                      let assignment = app.assignments.filter(x => x.id == doc.data().assignmentId)[0];
                      if (!assignment.reviews) assignment.reviews = 0;
                      assignment.reviews += 1;
                  });
              })
              .catch(function(error) {
                  console.log("Error getting documents: ", error);
              });
            }
          )
        })
      }
      
    });

  }
}).$mount("#app");