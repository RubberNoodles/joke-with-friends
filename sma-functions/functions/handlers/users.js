// File for dealing with authentication of users: signup, login
const { admin, db } = require('../util/admin');

const config = require('../util/config');
const firebase = require('firebase');

firebase.initializeApp(config);

// helper handlers/functions

const { validateSignupData, validateLoginData, simplifyUserData } = require('../util/validators.js');


exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // we also want to give them an image.

    const noImg = 'no-img.jpg';

    const { errors, valid } = validateSignupData(newUser);

    if (!valid) return res.status(400).json(errors);

    let token,userId;

    // Validating the data
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc =>{
            if (doc.exists) { //i guess all documents that .get() obtains has a parameter called .exists
                return res.status(400).json({ handle: "This handle is already taken"})
                // if the error pertains to "some field" the name will be "some field"
            } else {
                return firebase.auth()
                .createUserWithEmailAndPassword(newUser.email,newUser.password); 
                // apparently returning this ^ thing gives me the power to use ANOTHER .then
                // we first check if handle is the same, then we create the user. If there's an error, it's a problem with the email
            }
        })
        .then (data => {
            // user is created, now we give an "access token"
            userId = data.user.uid;
            return data.user.getIdToken(); // this "returns a promise"
        })
        .then(idToken => {
            //wtf is a token? I still don't know why we want aa token
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                timeCreated: new Date().toISOString(),
                userId
            }
            // .add and .set seem pretty similar (set will replace an entire document if need be)
            return db.doc(`/users/${newUser.handle}`).set(userCredentials)
        })
        .then(data => {
            return res.status(201).json({token});
        })
        .catch(err => {
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({email: "email already in use"});
            } else if (err.code === 'auth/weak-password') {
                return res.status(400).json({password: "Strength: too weak"});
            }
            console.error(err)
            return res.status(500).json({server: err.code}) // Later I want to show 
            // something like "Something went Wrong" this on the front end.
        });
    };

// helper authentication function

exports.login = (req, res) => {
    
    //first validate that the login fields are not retarded
    const loginCredentials = 
        {
        password: req.body.password, 
        email: req.body.email,
        };

    const { errors, valid } = validateLoginData(loginCredentials);

    if (!valid) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(loginCredentials.email,loginCredentials.password)
        .then( data => {
            return data.user.getIdToken();
        })
        .then( tokenId => {
            return res.json({tokenId});
        })
        .catch((err)=>{
            console.error(err);
            if (err.code === "auth/wrong-password") {
                return res.status(403).json({general: "Wrong Credentials, please try again"}); // 403 is unauthorized
            }
            return res.status(500).json({error: err.code});
        });
};

exports.uploadUserData = (req, res) => {
    const userData = simplifyUserData(req.body);
    // there are three things, bio, website, and location.

    db.doc(`users/${req.user.handle}`).update(userData)
    .then( () => {
        return res.json({ user: "User data updated"})
    })
    .catch( err => {
        console.error(err);
        return res.status(400).json( {error: err.code});
    })
};

exports.getUserData = (req, res) => {
    let userData = {};
    db.doc(`users/${req.user.handle}`).get()
    .then( doc => {
        if (doc.exists) {
            userData.credentials = {};
            userData.credentials = doc.data(); // this just receives the data from uploadUserData
            return db.collection('likes').where('userHandle', '==', req.user.handle).get();
        } else {
            return res.status(500).json({ documents: "Requested Documents not found"});
        }
    })
    .then( data => {
        userData.likes = [];
        data.forEach( jokeDoc => {
            userData.likes.push(jokeDoc.data());
        })
        return db.collection('notifications').where("recipient","==",req.user.handle)
            .orderBy("timeCreated","desc").limit(10).get();
    })
    .then( data => {
        userData.notifications = [];
        data.forEach( notifDoc => {
            userData.notifications.push({
                ...notifDoc.data(),
                notificationId: notifDoc.id
            });
        })
        return res.json( userData );
    })
    .catch( err => {
        console.error(err);
        return res.status(500).json({ error: err.code});
    });
    // some of the data is ez pz, but the likes are a bit more weird.
};

exports.getPublicUserData = (req, res) => {
    let userData = {};

    db.doc(`/users/${req.params.handle}`).get()
    .then( doc => {
        if (doc.exists) {
            userData.user = doc.data();
            return db.collection("Jokes")
                .where("userHandle","==",req.params.handle)
                .orderBy("timeCreated","desc")
                .get();
        } else {
            return res.status(404).json({ error: "User not found"});
        }
    })
    .then( data => {
        userData.jokes = [];
        data.forEach( jokeDoc => {
            userData.jokes.push(jokeDoc.data());
        })
        return res.status(200).json(userData);
    })
    .catch( err => {
        console.log(err);
        return res.json({error: err.code})
    })
};

exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path'); // wtf does this do?
    const os = require('os'); // probably along with above its dealing with pathing shit.
    const fs = require('fs'); // filesystem

    let imageFileName;
    let imageToBeUploaded;
    
    const busboy = new BusBoy({ headers: req.headers });

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {

        // we want to prevent bad mimetypes
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.staatus(400).json({error: "Wrong file type submitted"});
        }
        // given image.png, we want the .png file.
        const imageExtension = filename.split('.').slice(-1)[0]; // i.e. .png, .jpg
        imageFileName = `${Math.round(Math.random()*100000000)}.${imageExtension}`; //3424234.png
        // os.tmpdir because this is like a cloud server or something like that
        const filepath = path.join(os.tmpdir(), imageFileName)
        imageToBeUploaded = { filepath, mimetype } // this variable doesn't actually have cool info
        // .pipe is some node.js thing what.
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
        // complete busboy process? 
        // this admin stuff is in the firebase documentation.
        admin.storage().bucket().upload(imageToBeUploaded.filepath, { 
        resumable: false,
        metadata: {
            metadata: {
                contentType: imageToBeUploaded.mimetype
            }
        }
        })
        .then( () => {
            // alt=media prints it to browser rather than just downloading
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            // our user needs to have a key with the imageUrl
            // req.user.handle comes from the FBAuth. 
            // update takes in a field and a value and it updates that specific field.
            return db.doc(`/users/${req.user.handle}`).update({ imageUrl })
        })
        .then(() => {
            return res.json({ message: "Image Uploaded Successfully"});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code});
            });
    });
    busboy.end(req.rawBody);
};

exports.markNotificationAsRead = (req, res) => {
    // body input data is going to be an array of seen notifications
    // i'll just pretend like it's an array of id's and see where that goes
    // ok so there was the idea 
    const batch = db.batch();
    req.body.forEach( notifId => {
        // If I wanted I could also reassign some const variable with the appropriate document over and over again.
        batch.update( db.collection('notifications').doc(notifId), {"read" : true });
    });
    batch.commit().then( () => {
        return res.status(200).json({ notifications: "Marked as read."});
    })
    .catch( err => {
        console.error(err);
        return req.status(404).json({ error: err.code });
    });
};

// I want to try and implement an idea of "Groups" too.