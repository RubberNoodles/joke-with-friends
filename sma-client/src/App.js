import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './pages/home';
import Signup from './pages/signup';
import Login from './pages/login';
import Play from './pages/play';
import Navbar from './components/Navbar';

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
  return (
    <div className="App">
      <BrowserRouter>
      <ThemeProvider theme = {theme}>
      <Navbar />
      <div className="container">
        <Switch>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/signup" component={Signup}/>
          <Route exact path="/" component={Home}/>
          <Route exact path="/play" component={Play}/>
        </Switch>
      </div>
      </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
