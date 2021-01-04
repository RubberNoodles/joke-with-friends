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
                screamId: doc.id,
                ...doc.data()
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
    };

    db.collection('Jokes')
        .add(newJoke) // add will create a random id, while set will give us the name of an id.
        .then(doc => {
            return res.json({ message: `document ${doc.id} created successfully`});
        })
        .catch(err => {
            console.error(err);
            return es.status(500).json( {error: "Some issue"});
        })
};

exports.getJoke = (req,res) => {
    // gets all the data aabout the joke, and then also the data w.r.t to the comments
    const jokeData = {};
    const jokeId = req.params.jokeId.trim(); // quick rename
    db.doc(`Jokes/${jokeId}`).get()
    .then( doc => {
        if (doc.exists) {
            jokeData.content = doc.data();
        } else {
            return res.status(400).json({error: `Joke with id ${jokeId} not found`})
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
}