import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: () =>
        import("./views/Home.vue")
    },
    {
      path: "/users",
      name: "users",
      component: () =>
        import("./views/Users.vue")
    },
    {
      path: "/users/:id",
      name: "usersDetails",
      component: () =>
        import("./views/UsersDetails.vue")
    },
    {
      path: "/login",
      name: "login",
      component: () =>
        import("./views/Login.vue")
    },
    {
      path: "/review",
      name: "review",
      component: () =>
        import("./views/Review.vue")
    },
    {
      path: "/assignments/edit/:id",
      name: "assignmentsEdit",
      component: () =>
        import("./views/AssignmentsDetails.vue")
    },
    {
      path: "/assignments/new",
      name: "assignmentCreation",
      component: () =>
        import("./views/AssignmentsCreation.vue")
    },
    {
      path: "/assignments/:id",
      name: "view assignment",
      component: () =>
        import("./views/Solutions.vue")
    },
    {
      path: "/assignments",
      name: "assignments",
      component: () =>
        import("./views/Assignments.vue")
    },
    {
      path: "*",
      name: "404",
      component: () =>
        import("./views/Home.vue")
    }
  ]
});
