let db = [
    jokes: [
        {
            userHandle: 'user',
            body: 'this is the content of the description',
            createdAt: '2020-12-29T00:35:29.543Z', // This is an "ISOString" or some shit.
            likeCount: 5,
            commentCount: 2, // try to reduce reads on our database since firebase charges based on reads.
        }
    ]
]