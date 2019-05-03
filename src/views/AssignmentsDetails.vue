<template>
  <div v-if="assignment">

    <v-layout class="justify-center mb-2">
        <v-btn class="info" :to="'/submissions/'+assignment.id">View Submissions</v-btn>
    </v-layout>

    <v-layout justify-center>
      <v-flex xs12 sm10 md8 lg6>
        <v-card ref="form">
          <v-card-text>
            <v-text-field
              ref="name"
              v-model="assignment.name"
              :rules="[() => !!assignment.name || 'This field is required']"
              :error-messages="errorMessages"
              label="Name" required placholder="Name of assignment" color="success"
            ></v-text-field>
            <v-textarea ref="description"
              v-model="assignment.description" label="Description"
              placholder="Description of assignment" color="success"
            ></v-textarea>
            <v-select ref="course" :items="coursesIds" label="Course" color="success" v-model="assignment.course"></v-select>
            <v-select ref="subject" :items="getSubjects" label="Subject" color="success" v-model="assignment.subject"></v-select>
            <v-date-picker v-model="deadlineDate" color="success" full-width landscape></v-date-picker> <br>
            <v-time-picker v-model="deadlineTime" color="success" full-width landscape></v-time-picker> <br>

            <v-divider class="mt-2 mb-2"></v-divider>

            <h1 class="heading">Review Criteria</h1>

            <v-list two-line>
              <template v-for="(field, index) in assignment.reviewFields">
                <v-list-tile :key="field.name+field.description" >

                  <v-list-tile-content>
                    <v-list-tile-title>{{ field.name }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{ field.description }}</v-list-tile-sub-title>
                  </v-list-tile-content>

                  <v-list-tile-action>
                    <v-list-tile-action-text>{{ field.type }}</v-list-tile-action-text>
                    <v-layout>
                      <v-flex><v-btn flat icon color="info" @click="moveFieldUp(index)" v-if="index > 0">
                        <v-icon>arrow_upward</v-icon>
                      </v-btn></v-flex>
                      <v-flex><v-btn flat icon color="error" @click="deleteReviewField(index)">
                        <v-icon>delete</v-icon>
                      </v-btn></v-flex>
                    </v-layout>
                    
                  </v-list-tile-action>

                </v-list-tile>
                <v-divider v-if="index + 1 < assignment.reviewFields.length" :key="index" ></v-divider>
              </template>
            </v-list>

          </v-card-text>

          <v-divider></v-divider>

          <v-card-text>
            <v-layout class="justify-space-between">
              <v-flex class="px-1"> <v-text-field color="info" label="Field name" v-model="newField.name"></v-text-field> </v-flex>
              <v-flex class="px-1"> <v-select color="info" :items="typesArr" label="Field Type" v-model="newField.type"></v-select> </v-flex>
              
            </v-layout>
            <v-layout class="">
              <v-flex class="px-1"> <v-text-field color="info" label="Field description" v-model="newField.description"></v-text-field> </v-flex>
              <v-flex class="px-1 text-xs-right"> <v-btn color="info"  @click="addField">Add new field</v-btn> </v-flex>
            </v-layout>
          </v-card-text>

          <v-divider class="mt-2"></v-divider>

          <v-card-actions>
            <v-btn flat @click="$router.push('/assignments')">Cancel</v-btn>
            
            <v-spacer></v-spacer>
            <v-btn color="error" flat @click="deleteAssignment">Delete Assignment</v-btn>
            <v-btn color="success" flat @click="updateAssignment">Save Changes</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>

  </div>    
</template>

<script>
import firebase from "firebase";
import { mapState, mapGetters, mapActions } from "vuex";

var app;

export default {
  data: function() {
    return {
      assignment : null,
      deadlineDate : null,
      deadlineTime : null,
      newField: {type: 'Text'},
      typesArr: ['Text', 'Multiline text'],
      errorMessages: [],
      formHasErrors: false,
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
          reviewFields: this.assignment.reviewFields || [],
          deadline: deadline.getTime()
        })
        .then( function() {
          router.push("/assignments");
        })
        .catch(error => {
          console.error("Error updating assignment info: ", error);
        });
    },
    deleteReviewField: (index) => {
      app.assignment.reviewFields.splice(index, 1);
    },            
    moveFieldUp: (index) => {
      if (index > 0) {
        let tempReviewFields = [...app.assignment.reviewFields];
        tempReviewFields[index] = app.assignment.reviewFields[index-1];
        tempReviewFields[index-1] = app.assignment.reviewFields[index];
        app.assignment.reviewFields = [...tempReviewFields];
      }
    },
    addField: () => {
        if (!app.assignment.reviewFields) app.assignment.reviewFields = []
        app.assignment.reviewFields.push({
            name: app.newField.name, 
            type: app.newField.type,
            description: app.newField.description
        });
        app.newField = {type: 'Text'}
    },
    pad(x,c,n) {
      while( x.length < n ) x = c+x;
      return x; 
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
    },
    form() {
      return {
        name: this.assignment.name,
        description: this.assignment.description,
        course: this.assignment.course,
        subject: this.assignment.subject
      };
    }
  },
  created() {
    app = this;
    this.id = this.$route.params.id;
    this.assignment = this.assignments.filter( x => x.id == this.id )[0];
    if (!this.assignment) {
      console.log("No such assignment!");
      this.$router.push("/assignments");
      return;
    }
    let deadline = new Date();
    if ( this.assignment.deadline ) deadline = new Date( this.assignment.deadline )
    this.deadlineDate = deadline.toISOString().substr(0, 10)
    this.deadlineTime = `${ this.pad( ''+deadline.getHours(), '0', 2) }:${ this.pad( ''+deadline.getMinutes(), '0', 2) }`
  }
};
</script>
