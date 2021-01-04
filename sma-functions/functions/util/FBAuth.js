const { admin, db } = require("./admin");

// Match ID Tokens
module.exports = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1]; // taking the token
    } else {
        console.error('No token found')
        return res.status(403).json({error: 'Unauthorized'});
    }
    //verify that the token is the same as the one issued by us
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            // this decodedToken contains all the info that is associated with the user
            req.user = decodedToken;
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get(); // I'm not entirely sure, but it seems like it is returning what would normally be in a post
        })
        .then(data => {
            req.user.handle = data.docs[0].data().handle;
            req.user.imageUrl = data.docs[0].data().imageUrl;
            return next(); // apparently next is a function that allows the function to proceed??
        })
        .catch( err => {
            console.error('Error while verifying token');
            return res.status(403).json(err);
        })
        // if this code runs successfully (i.e. next() occurs, then the access tokens are the same and we're good)
        // also, we changed up some of the data in the request parameter I guess.
        // OH because before we had to literally define all the user data, but now it's stuff that's stored in our database.
        // and we just extract it from our database if the user is logged in.
};