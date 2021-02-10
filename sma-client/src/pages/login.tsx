import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// MUI imports
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

// other imports
import laughSVG from '../components/laugh.svg'


const padding = 20;
// I will be passing in a prop that contains error messages after submitting
// maybe. Or I won't idk
// Generally top level components like this login button won't have 
// props right. That makes sense.
function Login() {
    const [errors, setErrors] = useState({ email: '', password: '' });

    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handleSubmit = (event: React.MouseEvent) => {
        setIsLoading(true);
        axios
            .post('https://us-central1-social-media-6297e.cloudfunctions.net/api/login', { email, password })
            .then(res => {
                setIsLoading(false);
                console.log(res.data);
                localStorage.setItem('FBItem', `Bearer ${res.data.userIdToken}`);
                console.log(res.data.tokenId);
                window.location.href = '/';
            })
            .catch(err => {
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
            <Grid xs={12} sm={6}>
                <Grid item justify="center"
                    alignItems="center">
                    <img src='http://placekitten.com/200/300' />
                </Grid>
            </Grid>
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
                        <img src={laughSVG} />
                        <div style={{ height: padding }} />
                        <TextField
                            label="Email"
                            value={email}
                            onChange={handleEmailChange}
                            variant="outlined"
                            error={errors.email ? true : false}
                            helperText={errors.email} />
                        <TextField
                            label="Password"
                            value={password}
                            onChange={handlePasswordChange}
                            variant="outlined"
                            error={errors.password ? true : false}
                            helperText={errors.password} />
                        <Button
                            style={{
                                width: 170,
                                margin: 10
                            }}
                            color="primary"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            variant="contained">Login</Button>
                        <Typography style={{ fontSize: 12 }} component={Link} to="/signup">No account? Sign Up!</Typography>
                    </Grid>
                </div>
            </Grid>
        </Grid>

    )
}

export default Login
