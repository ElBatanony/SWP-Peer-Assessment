import Vue from "vue";
import Vuex from "vuex";
import { vuexfireMutations, firestoreAction } from 'vuexfire'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userDetails: {},
    user: null,
    notifications: [],
    accounts: [],
    assignments: [],
    submissions: [],
    courses: [],
    db: null,
    auth: null
  },
  getters: {
    isAdmin: state => {
      return state.userDetails.role == 'admin'
    }
  },
  mutations: {
    ...vuexfireMutations,
  },
  actions: {
    bindAssignments: firestoreAction(({ bindFirestoreRef, state }, course) => {
      if (course == null)
        return bindFirestoreRef('assignments', state.db.collection('assignments'))
      return bindFirestoreRef('assignments', state.db.collection('assignments').where("course", "==", course))
    }),
    bindSubmissions: firestoreAction(({ bindFirestoreRef, state }) => {
      return bindFirestoreRef('submissions', state.db.collection('submissions'))
    }),
    bindUserDetails: firestoreAction(({ bindFirestoreRef, state }, user) => {
      return bindFirestoreRef('userDetails', state.db.collection('users').doc(user.uid))
    }),
    bindAccounts: firestoreAction(({ bindFirestoreRef, state }) => {
      return bindFirestoreRef('accounts', state.db.collection('users'))
    }),
    bindCourses: firestoreAction(({ bindFirestoreRef, state }) => {
      return bindFirestoreRef('courses', state.db.collection('courses'))
    }),
    clearNotifications: firestoreAction(({ state }, uid) => {
      return state.db.collection('users')
        .doc(state.userDetails.id)
        .update({ notifications: [] })
        .then(() => {
          console.log('user updated!')
        })
    })
  }
});
