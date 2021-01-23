import React, { useState, useEffect } from 'react';
import Joke from "../components/Joke";

// MUI imports

import Grid from "@material-ui/core/Grid";

function Home() {
    const [jokeData, setJokeData] = useState([]);
    // figured out fetch, it's return res.json(), then there's another promise
    // with a data variable. The issue?
    // react doesn't like objects as their states. Something about them
    // being changeable?
    // Also there's the issue with doing just an array huh.
    

    useEffect (() => {
    fetch('https://us-central1-social-media-6297e.cloudfunctions.net/api/jokes')
    .then( res => {
        return res.json();
    })
    .then( data => {
        const tempJokeArray = []; // COOL OK
        // so the strategy is to get an array of the entire object
        // AND THEN push it to the react Hook state variable thing?
        // because constantly doing the setJokeData is kind of bad. 
        data.forEach( joke => {
            tempJokeArray.push({...joke});
        });
        return setJokeData(tempJokeArray);
    })
    .catch( err => {
        console.error(err);
    });// eslint-disable-next-line
    }, []);   

    let jokeDataMarkup = jokeData.length !== 0 
        ? (jokeData.map( doc => <Joke key={doc.jokeId} joke = {doc}/>))
        : (<p> Loading... </p>);

    return (
        <Grid spacing={2} container> 
            <Grid 
                container 
                spacing={2}
                sm={9} // interesting, it only worked when Grid was a container
                direction="row" // I was trying to get the cards to automatically fill in
                justify="flex-start"
                alignItems="flex-start">             
            {jokeDataMarkup} </Grid>
            <Grid item sm={3}>
            Hahaasdflk ajelfjsf lkj 
            </Grid>
        </Grid>
    )
}

export default Home
