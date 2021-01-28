// bruh this is the same as sma-client joke
export interface Joke extends JokeNoID {
    jokeId: string
}

// joke when we get it from firebase
export interface JokeNoID {
    commentCount: number,
    imageUrl: string,
    handle: string, // username?
    body: string,
    timeCreated: string,
    likeCount: number
}


export interface User {
    email: string,
    handle: string, // username
    imageUrl: string,
    timeCreated: string,
    userId: string,
}
