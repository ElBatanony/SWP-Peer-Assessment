const functions = require('firebase-functions');
var admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.modifyAssignment = functions.firestore
    .document('assignments/{assignmentID}')
    .onWrite((change, context) => {

        let assignment = change.after.exists ? change.after.data() : null;

        var db = admin.firestore();

        let notificationMessage = 'Assignment ' + assignment.name + ' has been updated!';

        return db.collection("users").get().then(function (querySnapshot) {
            let promises = []
            querySnapshot.forEach(function (doc) {
                let newnot = doc.data().notifications;
                if (!newnot) newnot = [];
                if ( newnot.indexOf(notificationMessage) == -1 ) newnot.push(notificationMessage);
                let p = db.collection("users").doc(doc.id).update( {"notifications": newnot } );
                promises.push(p);
            });
            return Promise.all(promises);
        });

    });