/* eslint-disable eqeqeq */
// Things that have to do with handling jokes. Atm you can make a joke, and get all the jokes.
import { db } from './../util/admin';
import { Joke, JokeNoID, Comment, instanceOfError, error, JokeWithComments } from './../types';

// EXPRESS ALLOWS ASYNC HANDLERS PGOPOGPOGPOGPO
// ⠄⠄⠄⠄⠄⠄⣀⣀⣀⣤⣶⣿⣿⣶⣶⣶⣤⣄⣠⣴⣶⣿⣿⣿⣿⣶⣦⣄⠄⠄
// ⠄⠄⣠⣴⣾⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦
// ⢠⠾⣋⣭⣄⡀⠄⠄⠈⠙⠻⣿⣿⡿⠛⠋⠉⠉⠉⠙⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿
// ⡎⣾⡟⢻⣿⣷⠄⠄⠄⠄⠄⡼⣡⣾⣿⣿⣦⠄⠄⠄⠄⠄⠈⠛⢿⣿⣿⣿⣿⣿
// ⡇⢿⣷⣾⣿⠟⠄⠄⠄⠄⢰⠁⣿⣇⣸⣿⣿⠄⠄⠄⠄⠄⠄⠄⣠⣼⣿⣿⣿⣿
// ⢸⣦⣭⣭⣄⣤⣤⣤⣴⣶⣿⣧⡘⠻⠛⠛⠁⠄⠄⠄⠄⣀⣴⣿⣿⣿⣿⣿⣿⣿
// ⠄⢉⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣦⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⢰⡿⠛⠛⠛⠛⠻⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⠸⡇⠄⠄⢀⣀⣀⠄⠄⠄⠄⠄⠉⠉⠛⠛⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⠄⠈⣆⠄⠄⢿⣿⣿⣿⣷⣶⣶⣤⣤⣀⣀⡀⠄⠄⠉⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⠄⠄⣿⡀⠄⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠂⠄⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⠄⠄⣿⡇⠄⠄⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃⠄⢀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⠄⠄⣿⡇⠄⠠⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠄⠄⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
// ⠄⠄⣿⠁⠄⠐⠛⠛⠛⠛⠉⠉⠉⠉⠄⠄⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿
// ⠄⠄⠻⣦⣀⣀⣀⣀⣀⣀⣤⣤⣤⣤⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠄



// change to async await?
const getAllJokes = (req: any, res: any) => {
    // https://firebase.google.com/docs/firestore/query-data/get-data for helpful documentation
    db.collection('Jokes')
        .orderBy('timeCreated', 'desc') // descending order; i think .get is basically a request (oh its the method?)
        .get()
        .then(data => {
            let jokes: Joke[] = [];
            data.forEach(doc => {
                // there must be a better way to get typesafe firebase requests
                let joke: JokeNoID = doc.data() as JokeNoID;
                jokes.push({
                    ...joke,
                    jokeId: doc.id,
                });
            });
            return res.json(jokes); // I guess the response parameter is just the thing we have to edit?
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

const postOneJoke = (req: any, res: any) => {
    let newJoke: JokeNoID = {
        body: req.body.body,
        handle: req.user.handle,
        timeCreated: new Date().toISOString(),
        imageUrl: req.user.imageUrl,
        commentCount: 0,
        likeCount: 0,
    };

    db.collection('Jokes')
        .add(newJoke) // add will create a random id, while set will give us the name of an id.
        .then(doc => {
            return res.status(201).json({
                ...newJoke,
                jokeId: doc.id
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: "Some issue" });
        })
};


const getJokeData = async (req: any, res: any) => {
    // gets all the data about the joke, and then also the data w.r.t to the comments

    try {
        const jokeId = req.params.jokeId.trim(); // quick rename
        const jokeData: Joke = await getJoke(jokeId);
        const comments: Comment[] = await getJokeComments(jokeId);
        // "return" joke type
        const retJoke: JokeWithComments = {
            comments: comments,
            ...jokeData
        }
        return res.status(200).json(retJoke)
    } catch (err) {
        // inspired from this article](https://medium.com/@arthurxavier/error-handling-in-long-promise-chains-155f610b5bc6)
        // except instanceof with interfaces are a bit different
        if (instanceOfError(err)) {
            // we have access to status and msg
            return res.status(err.status).json({ error: err.msg, extraInfo: err.extra })
        } else {
            // random msg
            return res.status(500).json({ msg: `Unknown error: ${err.code}` })
        }
    }
};

const commentOnJoke = async (req: any, res: any) => {
    if (req.body.body.trim() === '') return res.status(400).json({ body: "Must not be empty" });

    const newComment: Comment = {
        jokeId: req.params.jokeId.trim(),
        timeCreated: new Date().toISOString(),
        userHandle: req.user.handle,
        userImgUrl: req.user.imageUrl,
        body: req.body.body,
    };

    try {
        const doc = await db.doc(`Jokes/${req.params.jokeId}`).get();

        if (doc.exists) {
            const data: Joke = doc.data() as Joke;
            await doc.ref.update({ commentCount: data.commentCount + 1 }); // .ref is a new function woah
        } else {
            return res.status(400).json({ error: "joke not found" });
        }

        await db.collection('comments').add(newComment);
        return res.status(201).json(newComment);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.code });
    }
};

const likeJoke = async (req: any, res: any) => {
    try {
        // initialize documents
        // this fetches firestore twice. Maybe change?
        const jokeDocument = db.doc(`/Jokes/${req.params.jokeId}`);
        const jokeData: Joke = await getJoke(req.params.jokeId);
        const likeDoc = await getLikeDocument(req.user.handle, req.params.jokeId);

        // can only like a joke if the like document is EMPTY
        if (likeDoc.empty) {
            await db.collection('likes').add({
                jokeId: req.params.jokeId,
                userHandle: req.user.handle,
                timeCreated: new Date().toISOString()
            });
            // update jokeDocument
            jokeDocument.update({ likeCount: jokeData.likeCount + 1 });
            return res.json(jokeData);
        } else {
            return res.status(400).json({ error: 'joke already liked' });
        }
    } catch (err) {
        return handleError(err, res);
    }
};


const unlikeJoke = async (req: any, res: any) => {
    try { // initialize documents
        // this fetches firestore twice. Maybe change?

        const jokeDocument = db.doc(`/Jokes/${req.params.jokeId}`);
        const jokeData: Joke = await getJoke(req.params.jokeId); // automatically checks if joke doc exists
        const likeDoc = await getLikeDocument(req.user.handle, req.params.jokeId);

        if (!likeDoc.empty) {
            // if there a joke is actually liked; i want to remove this 
            await likeDoc.docs[0].ref.delete();
            await jokeDocument.update({ likeCount: jokeData.likeCount - 1 });
            return res.json(jokeData);
        } else {
            return res.status(400).json({ error: "joke already unliked" })
        }
    } catch (err) {
        return handleError(err, res);
    }


};

const deleteJoke = async (req: any, res: any) => {
    try {
        // check if the joke was made by the user.
        // since we need different errors if the joke does not exist, 
        // we cannot use `await getJoke()`
        const jokeDoc = await db.doc(`Jokes/${req.params.jokeId}`).get();
        const joke: JokeNoID = jokeDoc.data() as JokeNoID;

        // TODO: use later
        // const likeCount = joke.likeCount;

        if (jokeDoc.exists) {
            // cheeck authorization
            if (req.user.handle == joke.handle) {
                await jokeDoc.ref.delete();
            } else {
                return res.status(400).json({ error: "Not Authorized" });
            }
        } else {
            return res.status(500).json({ error: "Document not found" });
        }

        return res.json({ delete: "Joke was not funny, so it was deleted" });
    } catch (err) {
        return handleError(err, res);
    }


    // TODO: Deal with the user's like count LATER??
};

/*
 
    }
    const jokeId = req.params.jokeId.trim();
    const likeData = {
        userHandle: req.user.handle,
        jokeId
    };
    const resReturn = {};
    var likeCount = -1 ;
    db.doc(`users/${req.user.handle}`).get()
    .then( doc => {
        if (doc.exists) {
            return db.collection('likes').where('userHandle', '==', likeData.userHandle).get();
        } else {
            return res.status(400).json({ error: "Not authorized"});
        }
    })
    .then( docs => {
        var userLiked = false;
        docs.forEach( doc => {
            if (doc.data().jokeId == jokeId) userLiked = true;
        });
        if (!userLiked) {
            db.doc(`Jokes/${jokeId}`).get()
            .then(doc => {
                likeCount = doc.data().likeCount + 1;
                return db.doc(`Jokes/${jokeId}`).update({ likeCount });
            })
            .then( () => {
                resReturn.joke = `joke with id ${jokeId} has ${likeCount} likes`;
                return db.collection('likes').add(likeData);
            })
            .then( doc => {
                resReturn.like = `Joke with id ${doc.id} has been liked!`;
                return res.status(200).json(resReturn);
            })
            .catch( err => {
                console.error(err);
                return res.status(500).json({error: err.code});
            });
        } else {
            return res.status(500).json({ error: "User already liked image" });
        }
    })
    .catch( err => {
        console.error(err);
        return res.status(500).json({ error: err.code});
    })
};
*/

// HELPER FUNCTIONS

// try catch is apparently nicer, but it seems like kind of an anti pattern
// still very bloated. Im not sure if there's a better way though

const getJoke = async (jokeId: string): Promise<Joke> => {
    try {
        const jokeDoc = await db.doc(`Jokes/${jokeId}`).get();
        if (jokeDoc.exists) {
            const joke: Joke = {
                ...jokeDoc.data() as JokeNoID,
                jokeId: jokeId
            }
            return joke;
        } else {
            throw new Error(error(404, `Joke with id ${jokeId} not found`));
        }
    } catch (err) {
        throw new Error(error(500, err.code, `Unknown error when fetching joke with id ${jokeId}`));
    }
}

// is a try/catch block the best way?
const getJokeComments = async (jokeId: string): Promise<Comment[]> => {
    try {
        const querySnapshot = await db.collection('comments')
            .orderBy('timeCreated', 'desc')
            .where("jokeId", "==", jokeId)
            .get()
        let comments: Comment[] = [];
        querySnapshot.forEach(doc => { comments.push(doc.data() as Comment) });
        return comments;
    }
    catch (err) {
        throw new Error(error(400, err.code, `Unknown error when fetching comments from joke with id ${jokeId}`))
    }
}


const getLikeDocument = async (handle: string, jokeId: string): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> => {
    return db
        .collection('likes')
        .where('userHandle', '==', handle)
        .where('jokeId', '==', jokeId)
        .limit(1)
        .get();
}


// in a best case scenario, I would be able to know the type of 'res'
// in actuality, I have no idea. any types are kind of a bad pracctice in typescript
// bugs might occur if `err` doesn't have a `.code` attribute
const handleError = async (err: any, res: any) => {
    if (instanceOfError(err)) {
        // we have access to status and msg
        return res.status(err.status).json({ error: err.msg, extraInfo: err.extra })
    } else {
        // unknown msg
        return res.status(500).json({ msg: `Unknown error: ${err.code}` })
    }
}

export {
    getAllJokes,
    postOneJoke,
    getJokeData,
    commentOnJoke,
    likeJoke,
    unlikeJoke,
    deleteJoke
}