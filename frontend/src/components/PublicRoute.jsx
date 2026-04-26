import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';

// If user is already logged in, redirect them to home
// if not logged in, show the page normally
export default function PublicRoute({children}) {
    const {user} = useAuth();
    return user ? <Navigate to='/' /> : children;
}