import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// MUI imports
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles( theme => (
    { textField: theme.textField
    })
);

const padding = 20;
// I will be passing in a prop that contains error messages after submitting
// maybe. Or I won't idk
// Generally top level components like this login button won't have 
// props right. That makes sense.
function Login() {
    const [errors, setErrors] = useState({ email: '', password: ''});
    const classes = useStyles();

    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = event => {
        setIsLoading(true);
        axios
            .post('https://us-central1-social-media-6297e.cloudfunctions.net/api/login', {email, password})
            .then( res => {
                setIsLoading(false);
                localStorage.setItem('FBItem', `Bearer ${res.data.tokenId}`);
                console.log(res.data.tokenId);
            })
            .catch( err => {
                setIsLoading(false);
                setErrors({
                    email: err.response.data.email,
                    password: err.response.data.password
                });
                console.error(err.code);
            })

    };

    return (
    <Grid container>
    <Grid item xs={12} sm={6}>

    </Grid>
    <Grid container item 
        xs={12} sm={6}
        justify="center"
        direction="column"
        alignItems="center">
        <div style={{minWidth: 350, maxWidth: 400}}>
        <Grid
            container 
            direction="column"
            justify="center"
            alignItems="center"
        >
            <img src="../components/laugh.svg"/>
            <div style={{ height: padding}} /> 
            <TextField 
                label="Email"
                className={classes.textField}
                value = {email}
                onChange = {handleEmailChange}
                variant="outlined"
                error={errors.email ? true:false}
                helperText={errors.email}/>
            <TextField 
                label="Password"
                className={classes.textField}
                value = {password}
                onChange = {handlePasswordChange}
                variant="outlined"
                error={errors.password ? true:false}
                helperText={errors.password}/>
            <Button 
                style={{
                    width: 170,
                    margin: 10
                    }} 
                color = "primary"
                onClick={handleSubmit}
                disabled = {isLoading}
                variant="contained">Login</Button>
            <Typography style={{ fontSize:12 }} component={Link} to="/signup">No account? Sign Up!</Typography>
        </Grid>
        </div>
    </Grid>
    </Grid>

    )
}

export default Login
