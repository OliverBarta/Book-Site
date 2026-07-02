// manages the state of the favourite section and persists it in localStorage

import { createContext, useContext, useState, useEffect } from 'react';

const FavouriteSectionContext = createContext(null);

export function FavouriteSectionProvider({ children }) {
    const [favouriteSection, setFavouriteSection] = useState(() => {
        const stored = localStorage.getItem('favouriteSection');
        return stored !== null ? stored === 'true' : true;
    });

    useEffect(() => {
        localStorage.setItem('favouriteSection', favouriteSection);
    }, [favouriteSection]);

    return (
        <FavouriteSectionContext.Provider value={{ favouriteSection, setFavouriteSection }}>
            {children}
        </FavouriteSectionContext.Provider>
    );
}

export function useFavouriteSection() {
    const context = useContext(FavouriteSectionContext);
    if (!context) {
        throw new Error('useFavouriteSection must be used within a FavouriteSectionProvider');
    }
    return context;
}