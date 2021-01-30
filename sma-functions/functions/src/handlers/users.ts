// File for dealing with authentication of users: signup, login
import { bucket, db } from '../util/admin';

import config from '../util/config';
import firebase from 'firebase';


// helper handlers/functions

import { validateSignupData, validateLoginData, simplifyUserData } from './../util/validators';
import { ValidationError } from '../types/validate';
import { User } from './../types'


firebase.initializeApp(config);


const signup = async (req: any, res: any) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // we also want to give them an image.
    const noImg = 'no-img.jpg';

    try {
        // validation
        const possibleErrors: ValidationError[] = validateSignupData(newUser);
        if (possibleErrors.length > 0) return res.status(400).json(possibleErrors);


        // Validating the data
        const docSnapshot = await db.doc(`/users/${newUser.handle}`).get();

        if (docSnapshot.exists) {
            // if the error pertains to "some field" the name will be "some field"
            return res.status(400).json({ handle: "This handle is already taken" })
        }

        const userData = await firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        if (userData.user == null) {
            // Not sure when the .user can be null
            return res.status(400).json({ handle: 'Unable to retrieve user data' })
        }

        const userIdToken = await userData.user.getIdToken();
        const userCredentials: User = {
            handle: newUser.handle,
            email: newUser.email,
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
            timeCreated: new Date().toISOString(),
            userId: userData.user.uid
        }
        db.doc(`/users/${newUser.handle}`).set(userCredentials);
        return res.status(201).json({ userIdToken });

    } catch (err) {

        if (err.code === 'auth/email-already-in-use') {
            return res.status(400).json({ email: "email already in use" });
        } else if (err.code === 'auth/weak-password') {
            return res.status(400).json({ password: "Strength: too weak" });
        }
        console.error(err)
        return res.status(500).json({ server: err.code }) // Later I want to show 
        // something like "Something went Wrong" this on the front end.

    }
};

// helper authentication function

const login = async (req: any, res: any) => {

    //first validate that the login fields are not retarded
    const loginCredentials = {
        password: req.body.password,
        email: req.body.email,
    };

    try {

        const possibleErrors: ValidationError[] = validateLoginData(loginCredentials);
        if (possibleErrors.length > 0) return res.status(400).json(possibleErrors);


        const userData = await firebase.auth().signInWithEmailAndPassword(loginCredentials.email, loginCredentials.password);
        if (userData.user == null) {
            // Not sure when the .user can be null
            return res.status(400).json({ handle: 'Unable to retrieve user data' })
        }
        const userIdToken = await userData.user.getIdToken();
        return res.json({ userIdToken });

    } catch (err) {

        console.error(err);
        if (err.code === "auth/wrong-password") {
            return res.status(403).json({ email: "Error, email/password not found", password: "Error, email/password not found" }); // 403 is unauthorized
        }
        else if (err.code === "auth/invalid-email") {
            return res.status(403).json({ email: "Please enter a valid email" });
        }
        else if (err.code === "auth/user-not-found") {
            return res.status(403).json({ email: "Error, email/password not found", password: "Error, email/password not found" }); // 403 is unauthorized
        }
        return res.status(500).json({ error: err.code });
    }

};

const uploadUserData = async (req: any, res: any) => {
    const newUserData = simplifyUserData(req.body);
    // there are three things, bio, website, and location.

    try {
        await db.doc(`users/${req.user.handle}`).update(newUserData);
        return res.json({ user: "User data updated" })
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.code });
    }
};

exports.getUserData = (req, res) => {
    let userData = {};
    db.doc(`users/${req.user.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.credentials = {};
                userData.credentials = doc.data(); // this just receives the data from uploadUserData
                return db.collection('likes').where('userHandle', '==', req.user.handle).get();
            } else {
                return res.status(500).json({ documents: "Requested Documents not found" });
            }
        })
        .then(data => {
            userData.likes = [];
            data.forEach(jokeDoc => {
                userData.likes.push(jokeDoc.data());
            })
            return db.collection('notifications').where("recipient", "==", req.user.handle)
                .orderBy("timeCreated", "desc").limit(10).get();
        })
        .then(data => {
            userData.notifications = [];
            data.forEach(notifDoc => {
                userData.notifications.push({
                    ...notifDoc.data(),
                    notificationId: notifDoc.id
                });
            })
            return res.json(userData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
    // some of the data is ez pz, but the likes are a bit more weird.
};

exports.getPublicUserData = (req, res) => {
    let userData = {};

    db.doc(`/users/${req.params.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.user = doc.data();
                return db.collection("Jokes")
                    .where("userHandle", "==", req.params.handle)
                    .orderBy("timeCreated", "desc")
                    .get();
            } else {
                return res.status(404).json({ error: "User not found" });
            }
        })
        .then(data => {
            userData.jokes = [];
            data.forEach(jokeDoc => {
                userData.jokes.push(jokeDoc.data());
            })
            return res.status(200).json(userData);
        })
        .catch(err => {
            console.log(err);
            return res.json({ error: err.code })
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
    // where do we start importing the images again? I forget lmao
    // I'm guessing it's req.headers that contains the image tho hmm

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {

        // we want to prevent bad mimetypes
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: "Wrong file type submitted" });
        }
        // given image.png, we want the .png file.
        const imageExtension = filename.split('.').slice(-1)[0]; // i.e. .png, .jpg
        imageFileName = `${Math.round(Math.random() * 100000000)}.${imageExtension}`; //3424234.png
        // os.tmpdir because this is like a cloud server or something like that
        const filepath = path.join(os.tmpdir(), imageFileName)
        imageToBeUploaded = { filepath, mimetype } // this variable doesn't actually have cool info
        // .pipe is some node.js thing what.
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
        // complete busboy process? 
        // this admin stuff is in the firebase documentation.
        bucket.upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
            .then(() => {
                // alt=media prints it to browser rather than just downloading
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                // our user needs to have a key with the imageUrl
                // req.user.handle comes from the FBAuth. 
                // update takes in a field and a value and it updates that specific field.
                return db.doc(`/users/${req.user.handle}`).update({ imageUrl })
            })
            .then(() => {
                return res.json({ message: "Image Uploaded Successfully" });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code });
            });
    });
    busboy.end(req.rawBody);
};

exports.markNotificationAsRead = (req, res) => {
    // body input data is going to be an array of seen notifications
    // i'll just pretend like it's an array of id's and see where that goes
    // ok so there was the idea 
    const batch = db.batch();
    req.body.forEach(notifId => {
        // If I wanted I could also reassign some const variable with the appropriate document over and over again.
        batch.update(db.collection('notifications').doc(notifId), { "read": true });
    });
    batch.commit()
        .then(() => {
            return res.status(200).json({ notifications: "Marked as read." });
        })
        .catch(err => {
            console.error(err);
            return req.status(404).json({ error: err.code });
        });
};

// I want to try and implement an idea of "Groups" too.

export { signup, login, uploadUserData }