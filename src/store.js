import Vue from "vue";
import Vuex from "vuex";
import { vuexfireMutations, firestoreAction  } from 'vuexfire'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userDetails : {},
    user: null,
    notifications : [],
    assignments: [],
    accounts: [],
    courses: [],
    db : null
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
    bindUserDetails: firestoreAction( ({ bindFirestoreRef }, user ) => {
      return bindFirestoreRef('userDetails', state.db.collection('users').doc(user.uid) )
    }),
    bindAssignments: firestoreAction(({bindFirestoreRef, state }, course) => {
      if (course == null)
        return bindFirestoreRef('assignments', state.db.collection('assignments') )
      return bindFirestoreRef('assignments', state.db.collection('assignments').where("course", "==", course) )  
    }),
    bindUserDetails: firestoreAction(({ bindFirestoreRef, state }, user) => {
      return bindFirestoreRef('userDetails', state.db.collection('users').doc(user.uid))
    }),
    bindAccounts: firestoreAction(({ bindFirestoreRef, state } ) => {
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
