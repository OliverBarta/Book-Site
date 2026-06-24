import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

import './BookSelection.css'


function BookSelection() {
    const [loading, setLoading] = useState(true);
    const [books, setBooks] = useState([]);

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
                setBooks(data);
            }

            setLoading(false);
            
        }

        getBooks();

    }, []);

    if (loading) return <p>Loading books...</p>;
    if (!books) return <p>No books found</p>;


    return (
        <div className='booksArea'>
            {books.map(book => (
                <div className='formattingDiv'>
                    <button
                        key={book.id}
                        onClick={() => navigate(`/book/${book.title}/${book.id}/chapter/1`)}
                        className='bookSquare'>
                        <img src={book.cover_image_url} alt={book.id}></img>
                        <div className='bookName'>{book.title}</div>

                    </button>
                </div>
            ))}
        </div>
    )
}

export default BookSelection;