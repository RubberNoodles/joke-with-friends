import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// MUI imports
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => (
    {
        textField: theme.textField
    })
);

const padding = 20;
function Signup() {
    const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '', handle: '' });
    const classes = useStyles();

    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [handle, setHandle] = useState('');

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
    };

    const handleHandleChange = (event) => {
        setHandle(event.target.value);
    };

    const handleSubmit = () => {
        setIsLoading(true);
        axios
            .post('https://us-central1-social-media-6297e.cloudfunctions.net/api/signup',
                {
                    email, handle, password, confirmPassword
                })
            .then(res => {
                setIsLoading(false);
                console.log('res is shown below:')
                console.log(res);
                localStorage.setItem('FBItem', `Bearer ${res.data.token}`);
                window.location = "/"; // this should redirect to some verification
                // page at some point idk. 
            })
            .catch(err => {
                setIsLoading(false);
                console.log('error lol')
                console.log(err);
                setErrors({
                    ...err.response.data
                });
                console.error(err.code);
            })

    };

    return (
        <Grid container justify="center">
            <Grid container item
                xs={12} sm={6}
                justify="center"
                direction="column"
                alignItems="center">
                <div style={{ minWidth: 350, maxWidth: 400 }}>
                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                    >
                        <img src="../components/laugh.svg" />
                        <div style={{ height: padding }} />
                        <TextField
                            label="Email"
                            className={classes.textField}
                            value={email}
                            onChange={handleEmailChange}
                            variant="outlined"
                            error={errors.email ? true : false}
                            helperText={errors.email} />
                        <TextField
                            label="Username"
                            className={classes.textField}
                            value={handle}
                            onChange={handleHandleChange}
                            variant="outlined"
                            error={errors.handle ? true : false}
                            helperText={errors.handle} />
                        <TextField
                            label="Password"
                            className={classes.textField}
                            value={password}
                            onChange={handlePasswordChange}
                            variant="outlined"
                            error={errors.password ? true : false}
                            helperText={errors.password} />
                        <TextField
                            label="Confirm Password"
                            className={classes.textField}
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            variant="outlined"
                            error={errors.confirmPassword ? true : false}
                            helperText={errors.confirmPassword} />
                        <Button
                            style={{
                                width: 170,
                                margin: 10
                            }}
                            color="primary"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            variant="contained">Sign Up</Button>
                        <Typography style={{ fontSize: 12 }} component={Link} to="/login">Already have an account? Log in!</Typography>
                    </Grid>
                </div>
            </Grid>
        </Grid>

    )
}

export default Signup
