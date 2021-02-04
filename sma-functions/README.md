## Firebase Backend

In order for the front-end app to have access to our database, we have implemented an API
that allows for the developers and those with permission to quickly
query our database for the important information via [Firebase Functions](https://firebase.google.com/docs/functions).
These are identical in structure to [AWS lambda functions](https://aws.amazon.com/lambda/).
The purpose is for an idea of a "serverless computation," which will reduce
the difficulty of maintaining our backend. There are three advantages that
the firebase website cites:

- Integration with other firebase features
- Maintainence free--resources will be distributed to the cloud functions
  depending on the demand.
- Privacy of code on the front-end. We're making this open-source so it doesn't
  matter that much, but in general it seems to be good practice to avoid having
  all our functions reverse-engineerable on the client-side.

### Prerequisites

As usual, you must have `npm` or `yarn` or some method of installing `node` packages. Run

```sh
npm install -g firebase-tools
```

to receive access to crucial developer tools such as `firebase serve` and `firebase deploy`.

When initializing Firebase, avoid setting up anything other than **functions** and _maybe_
**firestore** to avoid unnecessary bulkiness.

_??? For some reason, we are still able to use Firebase Authentication functions and
the admin SDK and various other features like Firebase Storage. Why is this???_

### File Structure

All code is located inside `functions`, which is a folder initially created by firebase.

- `index.js` contains all the routing for our functions to be accessed via HTTP requests.
  - Uses Express to control routing, allowing for multiple requests to come from a single URL. This is advantageous to follow the REST architecture for API's (??? Josh confirm LOL). HTTP requests can be sent as GET/POST/PUT/DELETE, etc..
  - `api/FunctionName` are the functions that are available to anyone accessing the
    API. See the file for all possibilities. Example: try the HTTP GET request at [https://us-central1-social-media-6297e.cloudfunctions.net/api/jokes](https://us-central1-social-media-6297e.cloudfunctions.net/api/jokes).
  - There are three types of _triggers_ implemented that will watch the Firestore database for specific changes:
    - `changePictureOnUserUpdate` will watch for a user changing their profile picture
    - `delete/createNotificationOnComment/Like` will produce or delete a notification when a user comments/likes, and finally
    - `deleteDataOnJokeDelete` will run through the entire collection of `comments`, `likes`, and `notifications`, and delete all documents associated to the deleted joke.
- `dbschema.js` is currently outdated (01/30) (THIS WILL NEED TO BE UPDATED BEFORE WE START STRONG TYPING THINGS PROBABLY), but will contain the database structure for future reference. This will also include some of the return object structure for functions that receive information such as `api/user/handle`.
- `handlers` contains all the functions to be executed upon a call by `api/handler`.
  - `handlers/users.js` are functions associated to user authentication and data.
  - `handlers/jokes.js` are functions for any operations that can be performed by a user on jokes (i.e. retrieval, liking, commenting), or for them to make their own joke
- `util` are collections of files to contain Firebase data.
  - `util/FBAuth.js` is the most important: it provides code to authenticate users
    and allows for authenticated routes. For example, only users who are logged in can comment, like, or make their own joke.
  - `util/admin.js` calls variables such as the firestore database `db` for database querying and the administrator variable `admin` for authentication for signing up.
  - `util/validators.js` contains validators for the form fields that are
    currently in the app. These are: Logging In, Signing Up.
  - `util/config.js` apparently it's ok to keep this public. This information was
    found in the [Firebase Console Project Homepage](https://console.firebase.google.com/u/0/project/social-media-6297e/settings/general/web:NGRkYjg2MDItMmZmZS00MWQ4LWJjYjYtODlhMGIwMmIzZGU5)
