import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './pages/home';
import Signup from './pages/signup';
import Login from './pages/login';
import Play from './pages/play';
import Navbar from './components/Navbar';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import AuthRoute from './util/AuthRoute.js';

// MUI imports, for theme
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { purple, green } from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: purple[200],
        },
        secondary: {
            main: green[500],
        }
    }
}); // For the future -- I can do more styling hehe


function App() {

    let authenticated = false;

    const token = localStorage.FBItem;

    if (token) {
        const decodedToken = jwtDecode<JwtPayload>(token);
        console.log(decodedToken);
        // this code is HORRIBLE 
        // if the exp could be undefined, we just replace it with 100000000 
        // this basically means an undefined expiration will never expire.
        if ((decodedToken.exp || 100000000) * 1000 < Date.now()) {
            window.location.href = '/login';
            authenticated = false;
        } else {
            authenticated = true;
        }
    };

    return (
        <div className="App">
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <Navbar />
                    <div className="container">
                        <Switch>
                            <AuthRoute exact path="/login" component={Login} authenticated={authenticated} />
                            <AuthRoute exact path="/signup" component={Signup} authenticated={authenticated} />
                            <Route exact path="/" component={Home} />
                            <Route exact path="/play" component={Play} />
                        </Switch>
                    </div>
                </ThemeProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
