const admin = require('firebase-admin');

//var serviceAccount = require("./../../social-media-6297e-firebase-adminsdk-w1pmq-c12f903183.json");

admin.initializeApp();
  //credential: admin.credential.cert(serviceAccount),
  //databaseURL: "https://social-media-6297e-default-rtdb.firebaseio.com"

  
// Normally I would actually need to do more but I guess because 
// I initialized with firebase (.firebaserc file) then im good.

const db = admin.firestore();

module.exports = {admin, db};