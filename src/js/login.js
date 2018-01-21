//var database = firebase.database().ref("users/" + user.uid);
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

        document.getElementById("user_div").style.display = "none";
        document.getElementById("login_div").style.display = "block";
        document.getElementById("my_funds_div").style.display = "block";
        var user = firebase.auth().currentUser;

        if (user != null) {

            var email_id = user.email;
            document.getElementById("user_para").innerHTML = "Welcome User : " + email_id;

        }

    } else {
        // No user is signed in.

        document.getElementById("user_div").style.display = "block";
        document.getElementById("login_div").style.display = "none";
        document.getElementById("my_funds_div").style.display = "none";
    }
});

function login() {

    var userEmail = document.getElementById("emailLogin").value;
    var userPass = document.getElementById("passwordLogin").value;



    firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        window.alert("Error : " + errorMessage);

        // ...
    });
}

function signup() {

  var newUser = document.getElementById("username").value;
  var userPass = document.getElementById("password").value;
  var userEmail = document.getElementById("email").value;

    firebase.auth().createUserWithEmailAndPassword(userEmail, userPass).then(function (user) {
        // [END createwithemail]
        // callSomeFunction(); Optional
        // var user = firebase.auth().currentUser;
        var user = firebase.auth().currentUser;

        if (user != null) {
            const dbRefObject = firebase.database().ref().child('object');
            const dbRefList = dbRefObject.child("users/" + user.uid);
            dbRefList.set({
                username: newUser,
            });
        }
        user.updateProfile({
            username: newUser
        }).then(function () {
            // Update successful.
        }, function (error) {
            // An error happened.
        });
    }, function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/weak-password') {
            alert('The password is too weak. Please try again with a stronger password');
        } else {
            console.error(error);
        }
        // [END_EXCLUDE]
    });

  login();

}

function logout() {
    firebase.auth().signOut();
}
