const functions = require("firebase-functions");
var admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

exports.modifyAssignment = functions.firestore
    .document("assignments/{assignmentID}")
    .onWrite((change, context) => {
        let assignment = change.after.exists ? change.after.data() : null;

        var db = admin.firestore();

        let notificationMessage =
            "Assignment " + assignment.name + " has been updated!";

        return db
            .collection("users")
            .get()
            .then(function (querySnapshot) {
                let promises = [];
                querySnapshot.forEach(function (doc) {
                    let newnot = doc.data().notifications;
                    if (!newnot) newnot = [];
                    if (newnot.indexOf(notificationMessage) == -1)
                        newnot.push(notificationMessage);
                    let p = db
                        .collection("users")
                        .doc(doc.id)
                        .update({notifications: newnot});
                    promises.push(p);
                });
                return Promise.all(promises);
            });
    });

exports.addUserDoc = functions.auth.user().onCreate(user => {
    return admin
        .auth()
        .getUser(user.uid)
        .then(function (userRecord) {
            return admin
                .firestore()
                .collection("users")
                .doc(user.uid)
                .set({
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
    return db.collection("assignments")
        .doc(assignemntID)
        .get()
        .then(function (doc) {
            if (doc.exists) {
                if (doc.data().deadline > new Date().getTime()) {
                    return {message: "Assignment don't finished yet"};
                }
                var assessments = [];
                db.collection("assessments")
                    .where("assignmentId", "==", assignemntID)
                    .where("userId", "==", uid)
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(doc =>
                            assessments.push(doc.data().submissionId)
                        );
                    });
                return db.collection("submissions")
                    .where("assignmentId", "==", assignemntID)
                    .get()
                    .then(function (querySnapshot) {
                        let fname = "";
                        let ref = "";
                        let submit = false;
                        querySnapshot.forEach(function (doc) {
                            if (!(assessments.includes(doc.id) || doc.data().userId === uid)) {
                                fname = doc.data().fileName;
                                ref = doc.data().downloadURL;
                            }
                            if (doc.data().userId === uid) {
                                submit = true;
                            }
                        })

                        if (!submit) {
                            return {
                                message: "No submit"
                            };
                        }

                        if (ref == "") {
                            return {
                                message: "All works are checked"
                            };
                        }
                        return {
                            filename: fname,
                            message: ref
                        };
                    });
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        })
        .catch(function (error) {
            console.log("Error getting document:", error);
        });
});
