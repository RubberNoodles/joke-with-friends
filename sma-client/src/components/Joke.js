import React from 'react';
import { Link } from 'react-router-dom';

// MUI Themes
import { makeStyles } from '@material-ui/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles({
    root: {
        minWidth: 150
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
    <Grid item sm={6}>
    <Card>
    <CardContent>
        <Typography className={classes.title}> 
            <Typography component={Link} to={`user/${props.joke.handle}`}>
                {props.joke.handle}
            </Typography>'s Joke!
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
        <Button 
            component = {Link}
            to = {`joke/${props.joke.jokeId}`}
            color="primary"
            > See More</Button>
    </CardActions>
    </Card>
    </Grid>
    )
}

export default Joke;