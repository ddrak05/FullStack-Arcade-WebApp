import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import '../styles/account.css';

export default function Register() {
    // Get the values
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    // Error - Success Messages for the user
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try{
            // Send registration data to the backend
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, email, password})
            });

            const data = await response.json();
            if(!response.ok){
                setError(data.message);
                return;
            }

            setSuccess('Account created successfully. \n Redirecting to Login Page ... ');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err);
            console.error(err);
        }
    }

    return (
        <div className="page">
            <div className='card'>
                <h1>Create Account</h1>
                <p className='text'>Join our 🎮 Arcade and earn rewards</p>

                {error && <p className='error'>{error}</p>}
                {success && <p className='success'>{success}</p>}

                <form onSubmit={handleRegister}>
                    <div className='field'>
                        <label>Username</label>
                        <input
                            type='text'
                            placeholder='Username'
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            required
                        />
                    </div>

                    <div className='field'>
                        <label>Email</label>
                        <input
                            type='email'
                            placeholder='Email'
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            required
                        />
                    </div>

                    <div className='field'>
                        <label>Password</label>
                        <input
                            type='password'
                            placeholder='Password'
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            required
                        />
                    </div>

                    <button type='submit' className='button'>Register</button>

                    <p className='login-switch'>
                        Already have an account? <Link to='/login'>Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}