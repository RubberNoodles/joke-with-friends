import React from 'react';
import { Link } from 'react-router-dom';
import LikeButton from './LikeButton';
import CommentButton from './CommentButton';
import { Joke as JokeType } from './../types/';

// MUI Themes
import { makeStyles } from '@material-ui/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles({
    root: {
        minWidth: 150
    },
    title: {
        fontSize: 18
    },
    jokeCard: {
        display: 'flex',
        flexDirection: 'row'
    },
    image: {
        width: 80,
        height: 50,
        objectFit: 'cover'
    }
});

// This is going to be a component that does all the styling and the nice things we 
// want associated with a joke on the home page.

//props are kinda like the inputs into a function! but they
// look more like html attributes

interface JokeProps {
    joke: JokeType
}
// destructuring is nice so we don't have to write 'props.' in front of everything (if the keyword 'joke' isn't already used)
const Joke: React.FC<JokeProps> = ({ joke }) => {
    // currently taking in everything in a Joke doc,
    // and it's going to need the user's like array. to figure out
    // whether the user liked a post or not
    const classes = useStyles();

    return (
        <Grid item sm={6}>
            <Card>
                <CardContent>
                    <Typography className={classes.title}>
                        <Typography component={Link} to={`user/${joke.handle}`}>
                            {joke.handle}
                        </Typography>'s Joke!
    </Typography>
                </CardContent>
                <CardContent>
                    <Card className={classes.jokeCard}>
                        <CardMedia
                            className={classes.image}
                            component="img"
                            alt={joke.handle}
                            image={joke.imageUrl}
                        />
                        <CardContent>
                            <Typography> {joke.body} </Typography>
                        </CardContent>
                    </Card>

                </CardContent>

                <CardActions>
                    <Button
                        component={Link}
                        to={`joke/${joke.jokeId}`}
                        color="primary"
                    > See More
        </Button>

                    <LikeButton
                        // FIXME: joke does not have an isLiked attribute. How can we create it?
                        // isLiked={joke.isLiked || false} 
                        isLiked={false}
                        id={joke.jokeId} />

                    <CommentButton />
                    <IconButton>
                        <img src="./laugh.svg" />
                    </IconButton>
                </CardActions>
            </Card>
        </Grid>
    )
}

export default Joke;