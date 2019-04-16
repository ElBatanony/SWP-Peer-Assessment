<template>
  <div>
        <h1 class="Heading">Edit User Information</h1>

        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors"  v-bind:key="error">{{ error }}</li>
            </ul>
        </p>

        <v-text-field label="Name" v-model="user.name"></v-text-field>
        <v-text-field label="Email" v-model="user.email" readonly></v-text-field>

        <v-select :items="roles" label="Role" v-model="user.role"></v-select>

        <div v-if="user.role == 'student'">
            <v-select :items="coursesIds" label="Course" v-model="user.course"></v-select>
            <v-select :items="getGroups" label="Group" v-model="user.group"></v-select>
        </div>

    <v-btn @click="deleteUser" class="error">Delete User</v-btn>
    <v-btn @click="updateUser" class="success">Save Changes</v-btn>   

  </div>    
</template>

<script>
import firebase from "firebase";
import { mapState, mapGetters, mapActions } from "vuex";
export default {
  data: function() {
    return {
      errors: [],
      id : '',
      user: {},
      roles: ["student", "admin"]
    };
  },
  methods: {
    ...mapActions(["deleteUser", "updateUser"]),
    deleteUser() {
      let router = this.$router
      this.db
        .collection("users")
        .doc(this.id)
        .delete()
        .then(function() {
          console.log("User successfully deleted!");
          router.push("/users");
        })
        .catch(function(error) {
          console.error("Error removing user: ", error);
        });
    },
    updateUser() {

      this.errors = [];
      if (!this.user.name) this.errors.push("Name required.");
      if (!this.user.role) this.errors.push("Role required.");
      if (this.user.role == "student" && !this.user.course)
        this.errors.push("Course required");
      if (this.user.role == "student" && !this.user.group)
        this.errors.push("Group required");
      if (this.error && this.error.length > 0) return;

      let router = this.$router

      return this.db
        .collection("users")
        .doc(this.id)
        .update({
          name: this.user.name,
          role: this.user.role,
          course: this.user.course,
          group: this.user.group
        })
        .then( function() {
          router.push("/users");
        })
        .catch(error => {
          console.error("Error adding user information: ", error);
        });
    }
  },
  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapState(["accounts", "db", "courses"]),
    coursesIds() {
      let ret = [];
      this.courses.forEach(course => {
        ret.push(course.id);
      });
      return ret;
    },
    getGroups() {
        if (!this.courses) return null;
      for (let i = 0; i < this.courses.length; i++) {
        if (this.courses[i].id == this.user.course)
          return this.courses[i].groups;
      }
      return null;
    }
  },
  mounted() {
    this.id = this.$route.params.id;

    router = this.$router

    this.db
      .collection("users")
      .doc(this.id)
      .get()
      .then(snapshot => {
        this.user = snapshot.data();
        if (!this.user.course) this.user.course = 'None'
        if (!this.user.group) this.user.group = 'None'
        if (!this.user) {
            console.log("No such user!");
            router.push("/users");        
        }
      });
  }
};
</script>
