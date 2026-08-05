import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useFavouriteSection } from './hooks/useFavouriteSection.jsx';
import { useAuth } from './hooks/useAuth.jsx';

import './BookSelection.css'


function BookSelection() {
    const [loading, setLoading] = useState(true);
    // books gets filtered based on search term, allBooks is the unfiltered list of books
    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { favouriteSection } = useFavouriteSection();
    const [ favouriteList, setFavouriteList ] = useState([]);

    const { session } = useAuth();

    const navigate = useNavigate();

    // runs only once on initial load
    useEffect(() => {
        async function getBooks() {
            setLoading(true);

            const { data, error } = await supabase
                .from('books')
                .select('title,cover_image_url,id');

            if (error) {
                console.error("Error fetching a book: ", error.message);
            } else {
                setAllBooks(data);
                setBooks(data);
            }

            setLoading(false);
        }
        
        getBooks();
    }, []);

    // updates the supabase favourites for the current user
    async function updateSupaBaseFavourites(updatedFavourites) {
        const { error: upsertError } = await supabase
            .from('favourites')
            .upsert({
                user_id: session.user.id,
                book_ids: updatedFavourites,
                updated_at: new Date().toISOString(),
            });
        if (upsertError) {
            console.error("Error updating favourites: ", upsertError.message);
        }
    }
    
    useEffect(() => {
        const storedFavourites = localStorage.getItem('favouriteList');
        const localFavourites = storedFavourites ? JSON.parse(storedFavourites) : [];

        if (!session) {
            setFavouriteList(localFavourites);
            return;
        }

        // adds all favourites from database and local storage
        async function mergeFavourites() {
            setLoading(true);

            const { data, error } = await supabase
                .from('favourites')
                .select('book_ids')
                .eq('user_id', session.user.id)
                .maybeSingle();

            if (error) {
                console.error("Error fetching favourites: ", error.message);
                setLoading(false);
                return;
            }

            const dbFavourites = data?.book_ids || [];


            const merged = Array.from(
                new Set([...localFavourites, ...dbFavourites, ...favouriteList])
            );

            setFavouriteList(merged);
            localStorage.setItem('favouriteList', JSON.stringify(merged));

            await updateSupaBaseFavourites(merged);

            setLoading(false);
        }

        mergeFavourites();

    }, [session]);

    

    // function to add or remove a book from favourites, and update localStorage accordingly
    const addBookToFavourites = (bookId) => {
        if (!favouriteList.includes(bookId)) {
            const updatedFavourites = [...favouriteList, bookId];
            setFavouriteList(updatedFavourites);
            localStorage.setItem('favouriteList', JSON.stringify(updatedFavourites));
            if (session) updateSupaBaseFavourites(updatedFavourites);
            
        } else {
            const updatedFavourites = favouriteList.filter(id => id !== bookId);
            setFavouriteList(updatedFavourites);
            localStorage.setItem('favouriteList', JSON.stringify(updatedFavourites));
            if (session) updateSupaBaseFavourites(updatedFavourites);
        }
    };

    // runs every time searchTerm changes
    useEffect(() => {
        setBooks(allBooks.filter(book => book.title.toLowerCase().includes(searchTerm.toLowerCase())));
    }, [searchTerm]);

    // loading screen with cool spiny loading thing from uiverse
    if (loading) return (
        <>
            
            <div className='centered'>
                <svg className='svgLoading' viewBox="25 25 50 50">
                    <circle className='circleLoading' r="20" cy="50" cx="50"></circle>
                </svg>
                <h3 className='btn-shine'>Loading books...</h3>
            </div>
        </>
    );

    if (!books) return <p>No books found</p>;


    return (
        <>
            {favouriteSection &&
                <div className='favouriteArea'>
                    <div className='sectionLine'>
                        <h2>Favourites</h2>
                    </div>
                    {favouriteList.length === 0 &&
                        <div>No Favourites</div>
                    }
                    <div className='booksArea'>
                        {allBooks.map(book => (
                            favouriteList.includes(String(book.id)) && (
                                <div className='formattingDiv'>
                                    <button
                                        key={book.id}
                                        onClick={() => navigate(`/Landing/${book.title}/${book.id}`)}
                                        className='bookSquare'>
                                        <img src={book.cover_image_url} alt={book.id}></img>
                                        <div className='bookName'>{book.title}</div>

                                    </button>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            }
            <div className='sectionLine'>
                <h2>Full libarary</h2>
            </div>
            <input autoComplete='off' placeholder='Search' className='bookSearch'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            >
            </input>
            <div className='booksArea'>
                {books.map(book => (
                    <div className='formattingDiv' key={book.id}>
                        <button
                            key={book.id}
                            onClick={() => navigate(`/Landing/${book.title}/${book.id}`)}
                            className='bookSquare'>
                            <img src={book.cover_image_url} alt={book.id}></img>
                            <div className='bookName'>{book.title}</div>
                        </button>
                        <button className='favouriteButton'
                            onClick={() => addBookToFavourites(String(book.id))}
                        >
                            {favouriteList.includes(String(book.id)) ? '★' : '☆'}
                        </button>
                    </div>
                    
                ))}
            </div>
        </>
    )
}

export default BookSelection;