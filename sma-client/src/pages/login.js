import React, { useState } from 'react';
import axios from 'axios';

// MUI imports
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const padding = 20;

// I will be passing in a prop that contains error messages after submitting
// maybe. Or I won't idk
function Login(props) {
    const [errors, setErrors] = useState({ email: '', password: ''});

    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = event => {
        axios
            .post('https://us-central1-social-media-6297e.cloudfunctions.net/api/login', {email, password})
            .then( res => {
                console.log(res);
            })
            .catch( err => {
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
        >
            <img src="../components/laugh.svg"/>
            <div style={{ height: padding}} /> 
            <TextField 
                label="Email"
                value = {email}
                onChange = {handleEmailChange}
                variant="filled"
                error={errors.email ? true:false}
                helperText={errors.email}/>
            <div style={{ height: padding}} /> 
            <TextField 
                label="Password"
                value = {password}
                onChange = {handlePasswordChange}
                variant="filled"
                error={errors.password ? true:false}
                helperText={errors.password}/>
            <div style={{ height: padding}} /> 
            <Button style={{maxWidth: 200}} onClick={handleSubmit}>Login</Button>
            <Button>Sign Up!</Button>
        </Grid>
        </div>
    </Grid>
    </Grid>

    )
}

export default Login
