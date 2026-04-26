// createContext - creates a global storage from the app
// useContext - lets any component access the global storage
// useState - stores values that can change (like who is logged in)
import {createContext, useContext, useEffect, useRef, useState} from 'react';

// Creates the context object
// Any component in the app can reach into this "box"
const AuthContext = createContext();

export function AuthProvider({ children }) {
    // Load user and token from localStorage on startup
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const lastLevelRef = useRef(null);

    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || null;
    });

    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', jwtToken);
    }

    const logout = (reason = null) => {
        setUser(null);
        setToken(null);

        // Clear localStorage on logout
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        if (reason === 'expired') {
            window.location.href = '/login?expired=true';
        } else {
            window.location.href = '/login';
        }
    }

    // Refresh token
    const refreshToken = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/auth/refresh', {
                method: 'POST',
                headers: { 'Authorization' : `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.newToken) {
                setToken(data.newToken);
                localStorage.setItem('token', data.newToken);
            }
        } catch (err) {
            console.error("Token refresh failed", err);
        }
    }

    // Check every 2 seconds if token is expired
    useEffect(() => {
        const checkTokenExpiry = () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) return;

            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                const isExpired = Date.now() >= payload.exp * 1000;

                if (isExpired) {
                    logout('expired');
                }
            } catch (err) {
                logout();
            }
        };

        // Check every 2 seconds for a fast response during testing
        const interval = setInterval(checkTokenExpiry, 2000);
        return () => clearInterval(interval);
    }, []);

    // AuthContext.Provider is what shares the data
    // value={{ }} is what gets shared - any component can access:
    // user --> who is logged in
    // token --> their JWT Token
    // login --> function to log in
    // logout --> function to log out
    // refreshToken --> function to refresh token expiration time
    // {children} --> renders everything wrapped inside AuthProvider
    return(
        <AuthContext.Provider value={{user, token, login, logout, lastLevelRef, refreshToken}}>
            {children}
        </AuthContext.Provider>
    );
}

// custom hook - used instead of writing useContext(AuthContext)
// eg. const {user, token, login, logout} = useAuth();
export const useAuth = () => useContext(AuthContext);