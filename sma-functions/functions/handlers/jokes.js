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
            res.status(500).json( {error: "Some issue"});
            console.error(err);
        })
};