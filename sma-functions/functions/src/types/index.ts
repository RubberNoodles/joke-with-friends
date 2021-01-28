export interface JokeWithComments extends JokeNoID {
    comments: Comment[]
}

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


export interface Comment {
    body: string,
    jokeId: string,
    timeCreated: string,
    userHandle: string,
    userImgUrl: string,
}

// used in jokes.ts where we have async functions that should hold status code when fails
// to do things like res.status(code).json(code)
// but in functions that don't have access to the status
export interface Error {
    status: number, // e.g. 404
    msg: string,
    extra?: string, // optional extra info
}

// check if an object is an error type
export function instanceOfError(object: any): object is Error {
    return ('status' in object) && ('msg' in object);
}


// promises CANNOT be strictly typed in the error side rip
// https://github.com/microsoft/TypeScript/issues/6283
// we have to unionize it with any 
export type PError = Error | any

// simple function call to make error. I've seen this in APIs before, but is it really good design?
export const error = (status: number, msg: string, extra?: string): PError => ({ code: status, msg: msg, extra: extra })