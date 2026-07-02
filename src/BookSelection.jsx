import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

import './BookSelection.css'


function BookSelection() {
    const [loading, setLoading] = useState(true);
    // books gets filtered based on search term, allBooks is the unfiltered list of books
    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

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

    useEffect(() => {
        setBooks(allBooks.filter(book => book.title.toLowerCase().includes(searchTerm.toLowerCase())));
    }, [searchTerm]);

    if (loading) return <p>Loading books...</p>;
    if (!books) return <p>No books found</p>;


    return (
        <>

            <input autoComplete='off' placeholder='Search' className='bookSearch'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            >
                
            </input>
            <div className='booksArea'>
                {books.map(book => (
                    <div className='formattingDiv'>
                        <button
                            key={book.id}
                            onClick={() => navigate(`/Landing/${book.title}/${book.id}`)}
                            className='bookSquare'>
                            <img src={book.cover_image_url} alt={book.id}></img>
                            <div className='bookName'>{book.title}</div>

                        </button>
                    </div>
                ))}
            </div>
        </>
    )
}

export default BookSelection;