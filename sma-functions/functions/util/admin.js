const admin = require('firebase-admin');

admin.initializeApp(); // Normally I would actually need to do more but I guess because 
// I initialized with firebase (.firebaserc file) then im good.

const db = admin.firestore();

module.exports = {admin, db};