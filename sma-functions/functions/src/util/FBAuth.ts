import { auth, db } from './admin';
import * as express from 'express';
import { User } from './../types';

// Match ID Tokens
// TODO: find out how to type check req
// Bandaid fix: Just extending a class, but we should do more later
// because we also want req.body and req.user? handlers/users.ts:124:1
interface ExtendedRequest extends express.Request {
    [key: string]: any
}

const FBAuth = async (req: ExtendedRequest, res: express.Response, next: express.NextFunction) => {
    try {
        let idToken;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            idToken = req.headers.authorization.split('Bearer ')[1]; // taking the token
        } else {
            console.error('No token found')
            return res.status(403).json({ error: 'Unauthorized' });
        }

        //verify that the token is the same as the one issued by us
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;
        const data = await db.collection('users')
            .where('userId', '==', req.user.uid)
            .limit(1)
            .get(); // I'm not entirely sure, but it seems like it is returning what would normally be in a post

        const userData = data.docs[0].data() as User;
        /** before the typescript thing, the code was similar to this:
         *
         *  req.user = decodedToken;
         *  req.user.handle = data.docs[0].data().handle;
         *  req.user.imageUrl = data.docs[0].data().imageUrl;
         * 
         *  It seems we don't change all of the user data.
         *  Also decodedToken is a type `[key: string]: any`, 
         *  so why do we set req.user to it?
         * 
         */
        req.user = userData;
        return next();
    } catch (err) {
        console.error('Error while verifying token');
        return res.status(403).json(err);
    }

    // if this code runs successfully (i.e. next() occurs, then the access tokens are the same and we're good)
    // also, we changed up some of the data in the request parameter I guess.
    // OH because before we had to literally define all the user data, but now it's stuff that's stored in our database.
    // and we just extract it from our database if the user is logged in.
};

export default FBAuth;