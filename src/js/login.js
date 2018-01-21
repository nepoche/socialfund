var admin = require("firebase-admin");

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

        document.getElementById("user_div").style.display = "block";
        document.getElementById("login_div").style.display = "none";

        var user = firebase.auth().currentUser;

        if (user != null) {

            var email_id = user.email;
            document.getElementById("user_para").innerHTML = "Welcome User : " + email_id;

        }

    } else {
        // No user is signed in.

        document.getElementById("user_div").style.display = "none";
        document.getElementById("login_div").style.display = "block";

    }
});

function login() {

    var userEmail = document.getElementById("usernameLogin").value;
    var userPass = document.getElementById("passwordLogin").value;

    var userRef = firebase.database().ref('');

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

  var db = admin.database();
  var ref = db.ref("server/saving-data/fireblog");

  firebase.auth().createUserWithEmailAndPassword(userEmail, userPass)
  .then(function(user) {
    alert(user.userName)
  }).catch(function(error){
    console.log(error.message)
  });

  login();

}

function logout() {
    firebase.auth().signOut();
}
