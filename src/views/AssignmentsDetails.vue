<template>
  <div v-if="assignment">
    <h1 class="heading">Edit Assignment</h1>
    <v-text-field label="Name" v-model="assignment.name" placholder="Name of assignment"></v-text-field>
    <v-textarea label="Description" v-model="assignment.description" placeholder="Assignment description"></v-textarea>
    <v-select :items="coursesIds" label="Course" v-model="assignment.course"></v-select>
    <v-select :items="getSubjects" label="Subject" v-model="assignment.subject"></v-select>
    <v-date-picker v-model="deadlineDate" color="success ma-3"></v-date-picker>
    <v-time-picker v-model="deadlineTime" color="success ma-3"></v-time-picker>
    <br>
    <v-btn @click="deleteAssignment" class="error">Delete Assignment</v-btn>
    <v-btn @click="updateAssignment" class="success">Save Changes</v-btn>   
  </div>    
</template>

<script>
import firebase from "firebase";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  data: function() {
    return {
      deadlineDate : null,
      deadlineTime : null
    };
  },
  methods: {
    deleteAssignment() {
      let router = this.$router
      this.db
        .collection("assignments")
        .doc(this.assignment.id)
        .delete()
        .then(function() {
          console.log("Assignment successfully deleted!");
          router.push("/assignments"); 
        })
        .catch(function(error) {
          console.error("Error removing assignment: ", error);
        });
    },
    updateAssignment() {
      
      this.errors = [];
      if (!this.assignment.name) this.errors.push("Name required.");
      if (!this.assignment.description) this.errors.push("Description required.");
      if (!this.assignment.course) this.errors.push("Course required.");
      if (!this.assignment.subject) this.errors.push("Subject required.");
      if (!this.deadlineDate) this.errors.push("Deadline date required.");
      if (!this.deadlineTime) this.errors.push("Deadline time required.");
      if (this.error && this.error.length > 0) return;

      let deadline = new Date(this.deadlineDate)
      deadline.setHours(this.deadlineTime.split(':')[0])
      deadline.setMinutes(this.deadlineTime.split(':')[1])

      let router = this.$router

      return this.db
        .collection("assignments")
        .doc(this.assignment.id)
        .update({
          name: this.assignment.name,
          description: this.assignment.description,
          course: this.assignment.course,
          subject: this.assignment.subject,
          deadline: deadline.getTime()
        })
        .then( function() {
          router.push("/assignments");
        })
        .catch(error => {
          console.error("Error updating assignment info: ", error);
        });
    },
    getDeadline: function() {
      var date = new Date();
      date.setTime(this.deadline);
      return date.toString();
    }
  },
  computed: {
    ...mapState(['assignments','db','courses']),
    coursesIds() {
      let ret = [];
      this.courses.forEach(course => {
        ret.push(course.id);
      });
      return ret;
    },
    getSubjects() {
        if (!this.courses) return null;
      for (let i = 0; i < this.courses.length; i++) {
        if (this.courses[i].id == this.assignment.course)
          return this.courses[i].subjects;
      }
      return null;
    }
  },
  created() {
    if (!this.assignment) this.assignment = {}
    this.id = this.$route.params.id;
    this.assignment = this.assignments.filter( x => x.id == this.id )[0];
    if (!this.assignment) {
      console.log("No such assignment!");
      this.$router.push("/assignments");
      return;
    }
    let deadline = new Date(this.assignment.deadline)
    this.deadlineDate = `${deadline.getFullYear() }-${deadline.getMonth()}-${deadline.getDate()}`
    //this.deadlineTime = `${deadline.getHours() }-${deadline.getMinutes()}`
  }
};
</script>
