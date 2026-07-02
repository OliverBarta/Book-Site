import { useState, useEffect, useCallback } from 'react';

function getEffectiveTheme() {
    const stored = localStorage.getItem('theme'); // 'light' | 'dark' | null
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeClass(theme, isOverride) {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    if (isOverride) {
        root.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme');
    }
}

export function useTheme() {
    const [theme, setThemeState] = useState(getEffectiveTheme);

    // Sync DOM class with whatever we resolved on mount
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        applyThemeClass(theme, Boolean(stored));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const setTheme = useCallback((newTheme) => {
        localStorage.setItem('theme', newTheme);
        applyThemeClass(newTheme, true);
        setThemeState(newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    return { theme, toggleTheme };
}