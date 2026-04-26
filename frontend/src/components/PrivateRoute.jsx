import {Navigate, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';

// If user is not logged in, redirect them to login
// If logged in, show the page normally
export default function PrivateRoute({children}){
    const {user} = useAuth();
    return user ? children : <Navigate to='/login' />;
}