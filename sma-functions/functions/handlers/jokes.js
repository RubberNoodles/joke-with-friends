/* eslint-disable eqeqeq */
// Things that have to do with handling jokes. Atm you can make a joke, and get all the jokes.
const { db } = require('../util/admin');

exports.getAllJokes = (request, response) => {
    // https://firebase.google.com/docs/firestore/query-data/get-data for helpful documentation
    db.collection('Jokes')
        .orderBy('timeCreated', 'desc') // descending order; i think .get is basically a request (oh its the method?)
        .get()
        .then(data => {
        let jokes = [];
        data.forEach(doc => {
            jokes.push({
                jokeId: doc.id,
                ...doc.data(),
                });
        });
        return response.json(jokes); // I guess the response parameter is just the thing we have to edit?
    })
    .catch(err => {
        console.error(err);
        return response.status(500).json({error: err.code});
    });
};

exports.postOneJoke = (req, res) => {
    const newJoke = {
        body: req.body.body,
        handle: req.user.handle,
        timeCreated: new Date().toISOString(),
        imageUrl: req.user.imageUrl,
        commentCount:0,
        likeCount: 0,
    };

    db.collection('Jokes')
        .add(newJoke) // add will create a random id, while set will give us the name of an id.
        .then(doc => {
            const resJoke = newJoke;
            resJoke.jokeId = doc.id;
            return res.json(resJoke);
        })
        .catch(err => {
            console.error(err);
            return es.status(500).json( {error: "Some issue"});
        })
};

exports.getJokeData = (req,res) => {
    // gets all the data aabout the joke, and then also the data w.r.t to the comments
    let jokeData;
    const jokeId = req.params.jokeId.trim(); // quick rename
    db.doc(`Jokes/${jokeId}`).get()
    .then( doc => {
        if (doc.exists) {
            jokeData = doc.data();
            jokeData.jokeId = doc.id;
            return;
        } else {
            return res.status(404).json({error: `Joke with id ${jokeId} not found`})
        }
    })
    .catch( err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
    });

    db.collection('comments')
    .orderBy('timeCreated','desc')
    .where("jokeId","==",jokeId)
    .get()
    .then(data => {
        jokeData.comments = [];
        data.forEach( doc => {
            jokeData.comments.push(doc.data());
        });
        return res.status(200).json(jokeData)
    })
    .catch(err => {
        console.error(err);
        return res.status(400).json({ error: err.code });
    });
};

exports.commentOnJoke = (req, res) => {
    if (req.body.body.trim() === '') return res.status(400).json({body: "Must not be empty"});
    const newComment = {
        jokeId: req.params.jokeId.trim(),
        timeCreated: new Date().toISOString(),
        userHandle: req.user.handle,
        userImgUrl: req.user.imageUrl,
        body: req.body.body,
    };

    db.doc(`Jokes/${req.params.jokeId}`).get()
    .then( (doc) => {
        if (doc.exists) {
            return doc.ref.update({ commentCount: doc.data().commentCount + 1 }); // .ref is a new function woah
        } else {
            return res.status(400).json({ error: "joke not found" });
        }
    })
    .then( () => {
        return db.collection('comments').add(newComment);
    })
    .then( doc => {
        return res.status(200).json(newComment);
    })
    .catch( err => {
        console.error(err);
        return res.json({ error: err.code });
    });
};

exports.likeJoke = (req, res) => {
    const likeDocument = db
      .collection('likes')
      .where('userHandle', '==', req.user.handle)
      .where('jokeId', '==', req.params.jokeId)
      .limit(1);
  
    const jokeDocument = db.doc(`/Jokes/${req.params.jokeId}`);
  
    let jokeData;
  
    jokeDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          jokeData = doc.data();
          jokeData.jokeId = doc.id;
          return likeDocument.get();
        } else {
          return res.status(404).json({ error: 'joke not found' });
        }
      })
      .then((data) => {
        if (data.empty) {
          return db
            .collection('likes')
            .add({
              jokeId: req.params.jokeId,
              userHandle: req.user.handle
            })
            .then(() => {
              jokeData.likeCount++;
              return jokeDocument.update({ likeCount: jokeData.likeCount });
            })
            .then(() => {
              return res.json(jokeData);
            });
        } else {
          return res.status(400).json({ error: 'joke already liked' });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
  };


exports.unlikeJoke = (req, res) => {
    const likeDocument = db
      .collection('likes')
      .where('userHandle', '==', req.user.handle)
      .where('jokeId', '==', req.params.jokeId)
      .limit(1);
  
    const jokeDocument = db.doc(`/Jokes/${req.params.jokeId}`);

    let jokeData;

    // pathway: get data from the joke document => if 
    
    jokeDocument.get() // yes, always remember to check if a doc exists
    .then( (doc) => {
        if (doc.exists) {
            jokeData = doc.data();
            jokeData.jokeId = doc.id;
            return likeDocument.get();
        } else {
            return res.status(404).json({ error: 'joke not found' });
        }
    })
    .then( (doc) => {
        if (!doc.empty) {
            // if there a joke is actually liked; i want to remove this 
            return db.collection('likes').doc(doc.docs[0].data().jokeId).delete()
            .then(() => {
                jokeData.likeCount--;
                return jokeDocument.update({ likeCount: jokeData.likeCount });
            })
            .then(() => {
                return res.json(jokeData);
            });
        } else {
            return res.status(500).json({ error: "joke already unliked"})
        }

    })
    .catch( err => {
        console.error(err);
        return res.json({ error: err.code });
    });
};

exports.deleteJoke = (req, res) => {
    let likeNumber;
    //check if the joke was made by the user.
    db.doc(`Jokes/${req.params.jokeId}`).get()
    .then( doc => {
        if (doc.exists) {
            if (req.user.handle == doc.data().handle) {
                likeNumber = doc.data().likeCount;
                return doc.ref.delete();
            } else {
                return res.status(400).json({ error: "Not Authorized"});
            } 
        } else {
            return res.status(500).json({ error: "Document not found"});
        }
    })
    .then(() => {
        return res.json({ delete: "Joke was not funny, so it was deleted"});
    })
    .catch( err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
    });
    
    // Deal with the user's like count LATER?? WIP
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
