// this file holds our global types I guess. 
// not sure if this is a good design. Some people on reddit advocate this design.

export interface Joke {
    jokeId: string,
    commentCount: number,
    imageUrl: string,
    handle: string, // username?
    body: string,
    timeCreated: Date,
    likeCount: number
}