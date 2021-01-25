import React from 'react';
import { Link } from 'react-router-dom';

// MUI imports
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';

const Navbar: React.FC = () => {
    return (
        <div>
            <AppBar>
                <Toolbar className="nav-container">
                    <Button color="inherit" component={Link} to="/login">login</Button>
                    <Button color="inherit" component={Link} to="/signup">signup</Button>
                    <Button color="inherit" component={Link} to="/play">play</Button>
                    <Button color="inherit" component={Link} to="/">home</Button>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Navbar
