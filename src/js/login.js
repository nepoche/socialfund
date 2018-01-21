var fundCount = 0;

//var database = firebase.database().ref("users/" + user.uid);
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

        document.getElementById("user_div").style.display = "none";
        document.getElementById("login_div").style.display = "block";
        document.getElementById("my_funds_div").style.display = "block";
        var user = firebase.auth().currentUser;

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

function addFund() {

  fundCount++;

  var myFundsSection = document.getElementById('myFunds');
  var newRow = document.createElement("tr");
  var fundId = document.createElement("th");
  fundId.innerHTML = "Fund 4";
  var roi = document.createElement("th");
  roi.innerHTML = "1.02";
  var portVal = document.createElement("th");
  portVal.innerHTML = "2.34 BTC ($27,884)";
  var amountInvested = document.createElement("th");
  amountInvested.innerHTML = "1.12 BTC";

  newRow.appendChild(fundId);
  newRow.appendChild(roi);
  newRow.appendChild(portVal);
  newRow.appendChild(amountInvested);

  myFundsSection.appendChild(newRow);

}

// <tr>
//   <td>Fund 1</td>
//   <td>1.4</td>
//   <td>1.22 BTC ($14,102)</td>
//   <td>
//     <button type="button" class="btn btn-default btn-sm" data-toggle="modal" data-target="#addFundModal">
//       <span class="glyphicon glyphicon-plus"></span>
//     </button>
//   </td>
// </tr>

function createFund() {

  var allFunds = document.getElementById('allFunds');
  var newRow = document.createElement("tr");
  var fundId = document.createElement("th");
  fundId.innerHTML = "Fund 4";
  var roi = document.createElement("th");
  roi.innerHTML = "1.22 BTC ($14,102)";
  var minQuorum = document.createElement("th");
  minQuorum.innerHTML = "3";
  var debatePeriod = document.createElement("th");
  debatePeriod.innerHTML = "7";
  var voteMargin = document.createElement("th");
  voteMargin.innerHTML = "51%";
  var investPeriod = document.createElement("th");
  investPeriod.innerHTML = "30";
  var portVal = document.createElement("th");
  portVal.innerHTML = "1.00";

  newRow.appendChild(fundId);
  newRow.appendChild(portVal);
  newRow.appendChild(roi);
  newRow.appendChild(minQuorum);
  newRow.appendChild(debatePeriod);
  newRow.appendChild(voteMargin);
  newRow.appendChild(investPeriod);

  var addButton = document.createElement("button");
  addButton.setAttribute("type", "button");
  addButton.setAttribute("class", "btn btn-default btn-sm");
  addButton.setAttribute("data-toggle", "modal");
  addButton.setAttribute("data-target", "addFundModal");

  var randSpan = document.createElement("span");
  randSpan.setAttribute("class", "glyphicon glyphicon-plus");

  addButton.appendChild(randSpan);

  newRow.appendChild(addButton);

  allFunds.appendChild(newRow);

}
