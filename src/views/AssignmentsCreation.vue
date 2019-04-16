<template>
  <div>
      
            <h1 class="subtitle is-2">Create a new assignment</h1>

            <div class="box">
                <p v-if="errors.length">
                    <b>Please correct the following error(s):</b>
                    <ul>
                      <li v-for="error in errors" v-bind:key="error">{{ error }}</li>
                    </ul>
                </p>

            <div class="field">
                <label class="label">Name</label>
                <div class="control">
                    <input v-model="name" id="assignmentName" class="input" type="text" placeholder="Enter the name of the assignment" >
                </div>
            </div>
            
            <div class="field">
                <label class="label">Description</label>
                <div class="control">
                    <textarea v-model="description" id="assignmentDesc" class="textarea" placeholder="Enter the description of the assignment" ></textarea>
                </div>
            </div>

            <div class="columns">
                <div class="field column">
                    <label class="label">Course</label>
                    <div class="control">
                        <div class="select">
                            <select v-model="courseIndex" id="course-select">
                                <option disabled value="" >Choose a course</option>
                                <option v-for="(course, index) in coursesArr" :value="index" v-bind:key="index">{{course.name}}</option>
                            </select>
                        </div>
                    </div>
                </div>
            
                <div class="field column" id="subject">
                    <label class="label">Subject</label>
                    <div class="control">
                        <div class="select">
                            <select v-model="subjectIndex" id="subject-select">
                                <option disabled value="">Choose a subject</option>
                                <option v-for="(subject, index) in subjects" :value="index" v-bind:key="index">{{subject}}</option> 
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="has-text-right ">
                <a class="button is-medium is-danger" onclick="goToAssignments()">Cancel</a>
                <a class="button is-medium is-success" v-on:click="checkForm()">Add</a>
            </div>
            <p>Deadline: {{getDeadline()}}</p>
            <input type="datetime" lang="en" data-display-mode="inline" data-close-on-select="false">

            </div>  
  </div>    
</template>

<script>
import firebase from "firebase";
let db = firebase.firestore();

export default {
  data: function() {
    return {
      errors: [],
                coursesArr: [],
                name: null,
                description: null,
                courseIndex: null,
                subjectIndex: null,
                user: null,
                deadline: (new Date()).getTime()
    };
  },
  methods: {
    getDeadline: function()
            {
                var date = new Date();
                date.setTime(this.deadline);
                return date.toString();
            },
            submitAssignment: function() {
                var db = firebase.firestore();
                db.collection("assignments").add({
                    name: this.name,
                    description: this.description,
                    course: this.coursesArr[this.courseIndex].name,
                    subject: this.coursesArr[this.courseIndex].subjects[this.subjectIndex],
                    deadline: this.deadline
                })
                .then(function(docRef) {
                    console.log("Document written with ID: ", docRef.id);
                    window.location.href = "assignments";
                })
                .catch(function(error) {
                    console.error("Error adding document: ", error);
                });
            },
            checkForm: function (e) {
                console.log();
                if (this.name && this.description && !(this.courseIndex === null) && !(this.subjectIndex === null))
                {
                    this.submitAssignment();
                    return true;
                }

                this.errors = [];

                if (!this.name) {
                    this.errors.push('Name required.');
                }
                if (!this.age) {
                    this.errors.push('Description required.');
                }
                if (this.courseIndex === null) {
                    this.errors.push('Course required.');
                }
                if (this.subjectIndex === null) {
                    this.errors.push('Subject required.');
                }

                e.preventDefault();
            }
  },
  computed: {
            subjects: function () {
                    if(this.courseIndex === null)
                    {
                        return [];
                    }
                    else
                    {
                        this.subjectIndex = null;
                        return this.coursesArr[this.courseIndex].subjects;
                    }
                }
            },
  created() {
    
    firebase.auth().onAuthStateChanged(function (user) {
        app.user = user;
        if (user) {

        } else {
            // User is signed out.
            window.location.href = "login";
        }
    });

  function goToAssignments() {
    window.location.href = "assignments";
  }      

  courseSelect = document.getElementById('course-select');
  var db = firebase.firestore();
  db.collection("courses").get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
          // doc.data() is never undefined for query doc snapshots
          app.coursesArr.push(doc.data());
          //courseSelect.innerHTML += "<option value='" + doc.data().name + "'>" + doc.data().name + "</option>";
      });
  });

  // Initialize all input of type date
    var calendars = bulmaCalendar.attach('[type="datetime"]');

    // Loop on each calendar initialized
    for (var i = 0; i < calendars.length; i++) {
        // Add listener to date:selected event
        calendars[i].on('select', date => {
            if (new Date(date.data.value()).getTime()  > new Date().getTime() )
            {
                app.deadline = new Date(date.data.value()).getTime();
            }
        });
    }

    // To access to bulmaCalendar instance of an element
    var element = document.querySelector('#my-element');
    if (element) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        element.bulmaCalendar.on('select', function (datepicker) {
            console.log(datepicker.data.value());
        });
    }
  }
};
</script>
