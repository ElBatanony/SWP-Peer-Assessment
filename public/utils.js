function gbid(x) {
    return document.getElementById(x);
}

function goTo(x) {
    window.location.href = x;
}

function signOut() {
    firebase.auth().signOut().then(function () {
        console.log('Signed Out');
        goTo('/');
    }, function (error) {
        console.error('Sign Out Error', error);
    });
}