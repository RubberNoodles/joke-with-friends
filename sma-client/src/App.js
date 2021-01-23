import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import home from './pages/home';
import signup from './pages/signup';
import login from './pages/login';
import play from './pages/play';
import Navbar from './components/Navbar';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Navbar />
      <div className="container">
        <Switch>
          <Route exact path="/login" component={login}/>
          <Route exact path="/signup" component={signup}/>
          <Route exact path="/" component={home}/>
          <Route exact path="/play" component={play}/>
        </Switch>
      </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
