import React, { Fragment } from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import decode from 'jwt-decode';


// my own middlewarez
// import api from '../services/api';
import { store } from '../store/';
import {setCurrentUser, addError, setToken} from '../store/actions';
import RouteViews from './RouteViews';
import NavBar from './NavBar';




if(localStorage.jwtToken) {
    setToken(localStorage.jwtToken);
    try {
        store.dispatch(setCurrentUser(decode(localStorage.jwtToken)));
    } catch (err) {
        store.dispatch(setCurrentUser({}));
        store.dispatch(addError(err));
    }
}

    






const App = () => (
    
    <Provider store={store}>
        <BrowserRouter>
            <Fragment>
                <NavBar/>
                <RouteViews/>
            </Fragment>
     </BrowserRouter>
    </Provider>
);

export default App;