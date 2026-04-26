import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';

import '../styles/navbar.css'

export default function Navbar() {
    const {user, refreshToken, logout} = useAuth();
    const navigate = useNavigate();

    // Logs the user out and redirects to login page
    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return(
        <nav className='navbar'>
            <Link to='/' className='navbar-logo' onClick={refreshToken()}>
                🎮 Arcade
            </Link>

            <div className='navbar-links'>
                {user ? (
                    // Shown when user is logged in
                    <div className='navbar-pages'>
                        <Link to='/'>Home</Link>
                        <Link to='/achievements'>Achievements</Link>
                        <Link to='/leaderboard'>Leaderboard</Link>
                        <Link to={`/profile/${user.username}`}>Profile</Link>
                        <Link to='/settings'>Settings</Link>
                        <a className='logout' onClick={handleLogout}>Logout</a>
                    </div>
                ) : (
                    // Shown when user is not logged in
                    <div className='navbar-pages'>
                        <Link to='/login'>Login</Link>
                        <Link to='/register'>Register</Link>
                    </div>
                )}
            </div>
        </nav>
    )
}