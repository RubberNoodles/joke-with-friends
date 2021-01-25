import React from 'react';
import { Route, Redirect } from 'react-router-dom';

// type declarations from [this medium article xd](https://medium.com/octopus-wealth/authenticated-routing-with-react-react-router-redux-typescript-677ed49d4bd6)

interface AuthRouteProps {
    authenticated: boolean,
    path: string,
    exact?: boolean,
    component: React.ComponentType<any>
}

const AuthRoute: React.FC<AuthRouteProps> = ({ component: Component, authenticated, ...rest }) => (
    <Route
        {...rest}
        render={(props) =>
            authenticated === true ? <Redirect to="/" /> : <Component {...props} />
        }
    />
);

export default AuthRoute;
