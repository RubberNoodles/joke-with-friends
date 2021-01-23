import React from 'react';

// MUI Themes
import { makeStyles } from '@material-ui/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles({
    root: {
        minWidth: 275
    },
    title: {
        fontSize: 18
    }
});

// This is going to be a component that does all the styling and the nice things we 
// want associated with a joke on the home page.

//props are kinda like the inputs into a function! but they
// look more like html attributes

function Joke(props) {
    const classes = useStyles();

    return (
    <Card>
    <CardContent>
        <Typography className={classes.title}> 
            {props.joke.handle}'s Joke!
        </Typography>
    </CardContent>
    <CardMedia
        component = "img"
        alt = {props.joke.handle}
        image = {props.joke.imageUrl}
        />
    <CardContent>
        <Typography> {props.joke.body} </Typography>
    </CardContent>
    <CardActions>
        <Button color="primary"> See More</Button>
    </CardActions>
    </Card>
    )
}

export default Joke;