import {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from "../context/AuthContext.jsx";
import '../styles/account.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const {login} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('expired') === 'true') {
            setError("Session Expired. Please log in again!")
            window.history.replaceState({}, document.title, "/login")
        }
    }, [location, setError]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if(!response.ok){
                setError(data.message);
                return;
            }

            // Save user and token to AuthContext
            login(data.user, data.token);
            navigate('/');
        }catch (err){
            setError('Could not connect to server');
        }
    };

    return (
        <div className="page">
            <div className="card">
                <h1>Welcome Back</h1>
                <p className="text">Login to your Arcade Account</p>

                {error && <p className='error'>{error}</p>}

                <form onSubmit={handleLogin}>
                    <div className="field">
                        <label>Email</label>
                        <input
                            type='email'
                            placeholder='email'
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Password</label>
                        <input
                            type='password'
                            placeholder='password'
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            required
                        />
                    </div>

                    <button type='submit' className="button">Login</button>

                    <p className='login-switch'>
                        Don't have an account? <Link to='/register'>Register</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}