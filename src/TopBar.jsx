
import './TopBar.css'
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from './hooks/useTheme';


function TopBar() {

    const [settingsOpen, setSettingsOpen] = useState(false);
    const settingsRef = useRef(null);
    const buttonRef = useRef(null);
    const { theme, toggleTheme } = useTheme();

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


    return (
        <>
            <div className='topBar'>
                <Link to="/" className='title'>Book Site</Link>
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
                    <div className='sliderRow'>
                        <span className='DropdownLabel'>Dark mode toggle:</span>
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
                    
                </div>
            )}
            
        </>
    )
}

export default TopBar