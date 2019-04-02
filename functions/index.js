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

exports.addUserDoc = functions.auth.user().onCreate((user) => {
    return admin.auth().getUser(user.uid)
        .then(function (userRecord) {
            return admin.firestore().collection("users").doc(user.uid).set({
                name: userRecord.displayName,
                email: user.email,
                role: "student",
                notifications: []
            })
            .then(function () {
                console.log("Created a document for a new user " + user.uid);
            })
            .catch(function (error) {
                console.error("Error writing document for a new user: ", error);
            });
        })
        .catch(function (error) {
            console.log("Error fetching user data:", error);
        });
    
});

exports.getWork = functions.https.onCall((data, context) => {
        const assignemntID = data.assignmentID;
        const uid = context.auth.uid;
        var db = admin.firestore();
        return db.collection("assignments").doc(assignemntID).get().then(function (doc) {
            if (doc.data().deadline > (new Date().getTime()))
            {
                return {message: "Assignment don't finished yet"};
            } 
            return db.collection("assignments").doc(assignemntID).collection("users").get().then(function (querySnapshot) {
                done = [];
                ref = "";
                querySnapshot.forEach(function(doc)
                {
                    if(doc.id == uid)
                    {
                        if (doc.data().done)
                        {
                            done = doc.data().done.slice();
                        }
                        return;
                    }
                });
             
                querySnapshot.forEach(function(doc)
                {
                    if(doc.id != uid && !(done.includes(doc.data().reference)))
                    {
                        ref = doc.data().reference;
                        return;
                    }
                });
                if(ref == "")
                {
                    return {
                        message: "All works are checked"
                    };
    
                }
                return {
                    message: ref
                };
            });
        });
    });