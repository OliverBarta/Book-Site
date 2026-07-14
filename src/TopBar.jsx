
import './TopBar.css'
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { useFavouriteSection } from './hooks/useFavouriteSection.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import { supabase } from './supabaseClient';

function TopBar() {

    const { session } = useAuth();

    const navigate = useNavigate();

    const [settingsOpen, setSettingsOpen] = useState(false);
    const settingsRef = useRef(null);
    const buttonRef = useRef(null);
    const { theme, toggleTheme } = useTheme();

    const { favouriteSection, setFavouriteSection } = useFavouriteSection();

    const [editingUsername, setEditingUsername] = useState(false);
    const [usernameInput, setUsernameInput] = useState('');

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                settingsRef.current &&
                !settingsRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setSettingsOpen(false);
            }
        }

        if (settingsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [settingsOpen]);

    useEffect(() => {
        const stored = localStorage.getItem('favouriteSection');

        if (stored !== null) {
            setFavouriteSection(stored === 'true');
        } else {
            localStorage.setItem('favouriteSection', true);
        }
        
    }, []);

    useEffect(() => {
        localStorage.setItem('favouriteSection', favouriteSection);
    }, [favouriteSection]);

    const handleAuthButtonClick = async () => {
        if (session) {
            await supabase.auth.signOut();
        } else {
            navigate("/Login");
        }
    };

    const startEditingUsername = () => {
        setUsernameInput(session?.user?.user_metadata?.username || '');
        setEditingUsername(true);
    };

    const handleUsernameDone = async () => {
        if (!usernameInput.trim()) return;

        const { error } = await supabase.auth.updateUser({
            data: { username: usernameInput.trim() }
        });

        if (!error) {
            setEditingUsername(false);
        } else {
            console.error("Error updating username: ", error.message);
        }
    };

    return (
        <>
            <div className='topBar'>
                <Link to="/" className='title'>
                <svg
                        className="titleIcon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="28"
                        height="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        <path d="M12 7v14" />
                    </svg>
                    <span>Book Site</span>
                </Link>
                <button className='settingsButton' aria-label="Settings"
                    ref={buttonRef}
                    onClick={() => setSettingsOpen(!settingsOpen)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24"
                        width="24" 
                        height="24" 
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>
            </div>

            {settingsOpen && (
                <div className='settingsMenu' ref={settingsRef}>
                    {session && (
                        <div className='sliderRow'>
                            <span className='DropdownLabel'>
                                <div className='userInfo'>
                                    <div className='loggedInText'>Logged in:</div>
                                    <div>
                                        {session.user.email}
                                        
                                    </div>
                                    <div>
                                        {session.user.user_metadata?.username || "Anonymous"}
                                    </div>
                                </div>
                            </span>
                        </div>
                    )}

                    {session && (
                        <div className='usernameInputRow'>
                            <div className={`fakeButton${editingUsername ? ' active' : ''}`}>
                                {editingUsername ? 
                                        <input className='userNameInput'
                                        placeholder='Enter Username'
                                        value={usernameInput}
                                        onChange={(e) => setUsernameInput(e.target.value)}
                                    ></input>
                                     :
                                    <button className='editUsername'
                                        onClick={startEditingUsername}
                                    >
                                        Edit username
                                    </button>
                                }
                                
                            </div>

                            {editingUsername && <button className={`editUsernameDoneButton${editingUsername ? ' active' : ''}`}
                                onClick={handleUsernameDone}
                                disabled={!editingUsername}
                                tabIndex={editingUsername ? 0 : -1}
                            >
                                ✓
                            </button>}
                        </div>
                    )}

                    <div className='sliderRow'>
                        <button onClick={handleAuthButtonClick} className='login'>
                            {session ? 'Log out' : 'Login'}
                        </button>
                    </div>
                    <div className='sliderRow'>
                        <span className='DropdownLabel'>Dark mode:</span>
                        <button
                            className={`themeSwitch ${theme === 'dark' ? 'active' : ''}`}
                            role="switch"
                            aria-checked={theme === 'dark'}
                            aria-label="Toggle dark mode"
                            onClick={toggleTheme}
                        >
                            <span className='themeSwitchThumb' />
                        </button>
                    </div>
                    <div className='sliderRow'>
                        <span className='DropdownLabel'>Favourite section:</span>
                        <button
                            className={`themeSwitch ${favouriteSection ? 'active' : ''}`}
                            role="switch"
                            aria-checked={favouriteSection}
                            aria-label="Toggle favourite row"
                            onClick={() => setFavouriteSection(!favouriteSection)}
                        >
                            <span className='themeSwitchThumb' />
                        </button>
                    </div>
                    
                </div>
            )}
        </>
    )
}

export default TopBar