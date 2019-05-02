<template>
  <v-layout justify-center>
    <v-flex xs12 sm10 md8 lg6>
      <v-card ref="form">
        <v-card-text>
          <v-text-field
            ref="name"
            v-model="user.name"
            :rules="[() => !!user.name || 'This field is required']"
            :error-messages="errorMessages"
            label="Name"
            required
            color="success"
          ></v-text-field>
          <v-text-field
            ref="email"
            v-model="user.email"
            label="Email"
            readonly
            color="success"
          ></v-text-field>
          <v-select
            ref="role"
            v-model="user.role"
            :items="roles"
            label="Role"
            color="success"
          ></v-select>
          <div v-if="user.role == 'student'" >
              <v-select ref="course" :items="coursesIds" label="Course" color="success" v-model="user.course"></v-select>
              <v-select ref="group" :items="getGroups" label="Group" color="success" v-model="user.group"></v-select>
          </div>
        </v-card-text>
        <v-divider class="mt-5"></v-divider>
        <v-card-actions>
          <v-btn flat @click="$router.push('/users')">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" flat @click="deleteUser">Delete User</v-btn>
          <v-btn color="success" flat @click="updateUser">Save Changes</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import firebase from "firebase";
import { mapState, mapGetters, mapActions } from "vuex";
export default {
  data: function() {
    return {
      errorMessages: [],
      formHasErrors: false,
      id: "",
      user: {},
      roles: ["student", "admin"]
    };
  },
  methods: {
    ...mapActions(["deleteUser", "updateUser"]),
    deleteUser() {
      let router = this.$router;
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
      this.formHasErrors = false;

      let app = this;
      Object.keys(this.form).forEach(f => {
        if (!this.form[f]) this.formHasErrors = true;
        this.$refs[f].validate(true);
      });

      if (this.formHasErrors) {
        alert("Please input valid data");
        return;
      }

      let router = this.$router;

      return this.db
        .collection("users")
        .doc(this.id)
        .update({
          name: this.user.name,
          role: this.user.role,
          course: this.user.course,
          group: this.user.group
        })
        .then(function() {
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
    form() {
      return {
        name: this.user.name,
        email: this.user.email,
        role: this.user.role,
        course: this.user.course,
        group: this.user.group
      };
    },
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

    let router = this.$router;

    this.db
      .collection("users")
      .doc(this.id)
      .get()
      .then(snapshot => {
        this.user = snapshot.data();
        if (!this.user.course) this.user.course = "None";
        if (!this.user.group) this.user.group = "None";
        if (!this.user) {
          console.log("No such user!");
          router.push("/users");
        }
      });
  }
};
</script>
