
let db = {
    user: {
        handle: 'user',
        email: 'someone@gmail.com',
        timeCreated: '2021-01-03T20:46:26.852Z',
        location: ' canada',
        userId: 'vc3u52asWKSJnTxaXnLS33j8NK32',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/social-media-6297e.appspot.com/o/791.jpg?alt=media',
        website: 'https://google.com',
        likes: [
            joke1, 
            joke2
        ]
    },
    jokes:
        {
            handle: 'user',
            body: 'this is the content of the description',
            timeCreated: '2020-12-29T00:35:29.543Z', // This is an "ISOString" or some shit.
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/social-media-6297e.appspot.com/o/791.jpg?alt=media",
            likeCount: 5,
            commentCount: 2,
            jokeId: "nX07hphn1yd3OfDm7Uar", // try to reduce reads on our database since firebase charges based on reads.
        },
}

const userDetails = {
        // redux data?? (its for our frontend applicaton and the information we use to populate the actual profile that the user sees)
        credentials: {
            handle: 'user',
            email: 'someone@gmail.com',
            timeCreated: '2021-01-03T20:46:26.852Z',
            location: ' canada',
            userId: 'vc3u52asWKSJnTxaXnLS33j8NK32',
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/social-media-6297e.appspot.com/o/791.jpg?alt=media',
            website: 'https://google.com',
            },
        likes: [
            {
                userHandle: 'user',
                jokeId: "adlkfjaslekfj",
            },
            {
                userHandle: 'user',
                jokeId: "adlkfjaslekfj",
            }
        ]
    };

const comment = {
    body: "this is commenting on some joke",
    jokeId: "2wR76BBGqeJyLAeWM9eG",
    timeCreated: "January 3, 2021 at 12:00:00 AM UTC-7",
    userHandle: "user"
};

const notifications = [
    {
        recipient: 'user',
        sender: 'otherUser',
        read: 'true | false',
        jokeId: 'alksdjflaawehkfjha ;el',
        type: 'like | comment',
        createdAt: 'theISOSTRING DATE thing'
}
]