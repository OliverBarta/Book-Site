import "./LoginPage.css";
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useState } from 'react';
import { useAuth } from './hooks/useAuth.jsx';


function LoginPage() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
    
        const { data, error } = isSignUp
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });
    
        setLoading(false);
    
        if (error) {
          setError(error.message);
          return;
        }
    
        if (isSignUp && data.user && !data.session) {
          setError('Check your email to confirm your account.');
          return;
        }
    
        useAuth?.(data.session);
    };

    return (
        <>
            <div className="loginBox">
                <h2>{isSignUp ? 'Create Account' : 'Login'}</h2>
                <div className="loginInputHeader">Email:</div>
                <input
                    className="loginInput"
                    placeholder="Enter..."
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className="loginInputHeader">Password:</div>
                <input
                    className="loginInput"
                    placeholder="Enter..."
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <div className="loginError">{error}</div>}

                <button className="loginButton" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Login'}
                </button>

                <button className="loginButton" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                </button>
            </div>
        </>
    )
}

export default LoginPage;