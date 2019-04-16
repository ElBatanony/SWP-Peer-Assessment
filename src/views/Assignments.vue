<template>
  <div>
      
    <h1 class="headline">Your Assignments</h1>
    
    <div v-for="assignment in assignments" v-if="(assignment.course == userDetails.course || isAdmin)" v-bind:key="assignment.name">
        <span class="title">{{assignment.name}} </span>
        <v-chip color="green lighten-1">{{assignment.course}}</v-chip>
        <v-chip color="green lighten-1">{{assignment.subject}}</v-chip>

        <v-btn small :to="'/assignments/edit/'+assignment.id" v-if="userDetails.role == 'admin'" class="warning">Edit Assignment</v-btn>
        <v-btn :to="'/assignments/'+assignment.id" v-if="userDetails.role == '!admin'" class="warning">View Assignment</v-btn>
    </div>

    <v-btn to="/assignments/new" v-if="userDetails.role == 'admin'" class="info">Add Assignment</v-btn>
  </div>    
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(['isAdmin']),
    ...mapState([
    'user','userDetails','assignments'
    ])
  }
};
</script>
