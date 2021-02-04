// File for dealing with authentication of users: signup, login
import { bucket, db } from '../util/admin';

import config from '../util/config';
import firebase from 'firebase';


// helper handlers/functions

import { validateSignupData, validateLoginData, simplifyUserData } from './../util/validators';
import { ValidationError } from '../types/validate';
import { User, Joke, Notification, NotificationNoID, SuperUser, PublicUserData } from './../types'

// other imports
import * as express from 'express';
import * as BusBoy from 'busboy';
import * as path from 'path' // wtf does this do?
import * as os from 'os' // probably along with above its dealing with pathing shit.
import * as fs from 'fs'; // filesystem


firebase.initializeApp(config);


const signup = async (req: express.Request, res: express.Response) => {
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

        // user is created, now we give an "access token"
        const userIdToken = await userData.user.getIdToken();
        const userCredentials: User = {
            handle: newUser.handle,
            email: newUser.email,
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
            timeCreated: new Date().toISOString(),
            userId: userData.user.uid
        }
        // .add and .set seem pretty similar (set will replace an entire document if need be)
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

const login = async (req: express.Request, res: express.Response) => {

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

// have to use req: any so req.user and req.body typechecks
// this also happens later on a couple times
// TODO: Figure out a way to make better types
const uploadUserData = async (req: any, res: express.Response) => {
    const newUserData = simplifyUserData(req.body.bio, req.body.website, req.body.location);
    // there are three things, bio, website, and location.

    try {
        await db.doc(`users/${req.user.handle}`).update(newUserData);
        return res.json({ user: "User data updated" })
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.code });
    }
};

const getUserData = async (req: any, res: express.Response) => {
    try {

        const doc = await db.doc(`users/${req.user.handle}`).get();
        if (!doc.exists) {
            return res.status(500).json({ documents: "Requested Documents not found" });
        }

        const user: User = doc.data() as User; // this just receives the data from uploadUserData
        const likesSnapshot = await db.collection('likes').where('userHandle', '==', user.handle).get();
        const jokesLiked: Joke[] = likesSnapshot.docs.map(jokeDoc => jokeDoc.data() as Joke)

        const notifsSnapshot = await db.collection('notifications')
            .where("recipient", "==", user.handle)
            .orderBy("timeCreated", "desc").limit(10).get();
        const notifications: Notification[] = notifsSnapshot.docs.map(doc => {
            const notifNoID = doc.data() as NotificationNoID;
            return {
                notificationId: doc.id,
                ...notifNoID
            }
        });

        // constructing user data
        // a Superuser is just a user with more data: the jokes they liked and notifs they have
        const superUser: SuperUser = {
            credentials: user,
            likes: jokesLiked,
            notifications: notifications,
        }
        return res.json(superUser);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.code });
    }
    // some of the data is ez pz, but the likes are a bit more weird.
};

const getPublicUserData = async (req: express.Request, res: express.Response) => {
    try {
        // get user doc data and check if it exists
        const doc = await db.doc(`/users/${req.params.handle}`).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "User not found" });
        }
        // cast the firebase .data() into a User type. 
        // Is this the best way? Should we do some decoding? 
        const user = doc.data() as User;

        // get jokes
        const jokesSnapshot = await db.collection("Jokes")
            .where("userHandle", "==", user.handle)
            .orderBy("timeCreated", "desc")
            .get();

        const jokesLiked: Joke[] = jokesSnapshot.docs.map(doc => doc.data() as Joke);
        const publicUserData: PublicUserData = {
            credentials: user,
            likes: jokesLiked
        }
        return res.status(200).json(publicUserData);
    } catch (err) {

        console.log(err);
        return res.json({ error: err.code })
    }
};

const uploadImage = async (req: any, res: express.Response) => {

    const busboy = new BusBoy({ headers: req.headers });
    // where do we start importing the images again? I forget lmao
    // I'm guessing it's req.headers that contains the image tho hmm

    let imageFileName: string, imageToBeUploaded: { filepath: string; mimetype: string; };

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

    // Can busboy handle async functions?
    // if they can, it'll be super nice. 
    // Right now, rewriting this with async is a little more uglier. 
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

const markNotificationAsRead = async (req: express.Request, res: express.Response) => {
    // body input data is going to be an array of seen notifications
    // i'll just pretend like it's an array of id's and see where that goes
    // ok so there was the idea 
    try {
        const batch = db.batch();
        req.body.forEach((notifId: string) => {
            // If I wanted I could also reassign some const variable with the appropriate document over and over again.
            batch.update(db.collection('notifications').doc(notifId), { "read": true });
        });
        await batch.commit()
        return res.status(200).json({ notifications: "Marked as read." });
    } catch (err) {
        console.error(err);
        return res.status(404).json({ error: err.code });
    }

};

// I want to try and implement an idea of "Groups" too.

export { signup, login, uploadUserData, getUserData, getPublicUserData, markNotificationAsRead, uploadImage }