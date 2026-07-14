import { useState, useEffect, useRef } from 'react';
import "./BookLanding.css"
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';

// gets the supabase progress chapter
async function getSupaBaseChapter(bookId, session) {
    const { data, error } = await supabase
        .from('progress')
        .select('chapter')
        .eq('user_id', session.user.id)
        .eq('book_id', bookId)
        .maybeSingle();

    if (error) {
        console.log("Error getting supabse chapter", error.message);
        return 0;
    }

    return data?.chapter || 0;
}

function BookLanding() {

    const navigate = useNavigate();
    const { session } = useAuth();

    const [loading, setLoading] = useState(true);
    const [totalChapters, setTotalChapters] = useState(0);
    const [description, setDescription] = useState("");
    const [imgAddress, setImgAddress] = useState("");
    const [continueChapter, setContinueChapter] = useState(1);
    const [chapterInput, setChapterInput] = useState("");
    
    const { title, bookId } = useParams();

    // this variable and the following useEffect are used to prevent the input box from transitioning when the window is resized, which can cause a jarring effect
    const inputRef = useRef(null);
    useEffect(() => {
        let resizeTimeout;

        function handleResize() {
            inputRef.current?.classList.add('no-transition');
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                inputRef.current?.classList.remove('no-transition');
            }, 100);
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, []);

    useEffect(() => {
        async function getBookDetails() {
            setLoading(true);

            const { data: bookData, error: bookError } = await supabase
                .from('books')
                .select('total_chapters, description, cover_image_url')
                .eq('id', bookId)
                .maybeSingle();
            
            if (bookError) {
                console.error("Error fetching book: ", bookError.message);
            } else if (bookData) {
                setTotalChapters(bookData.total_chapters);
                setDescription(bookData.description);
                setImgAddress(bookData.cover_image_url);
            } else {
                console.warn("No book found with ID:", bookId);
            }

            let savedChapter = parseInt(localStorage.getItem(`book_${bookId}_last_chapter`), 10) || 0;

            if (session) {
                savedChapter = Math.max(savedChapter, await getSupaBaseChapter(bookId, session));

                localStorage.setItem(`book_${bookId}_last_chapter`, savedChapter);
            }

            if (savedChapter) {
                setContinueChapter(savedChapter);
            } else {
                setContinueChapter(1);
            }

            setLoading(false);
        }

        getBookDetails();

    }, [bookId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (chapterInput) {
            navigate(`/book/${title}/${bookId}/chapter/${chapterInput}`);
        }
    };

    if (loading) return <h3>Loading book details...</h3>;

    return (
        <>
            <h1>{title}</h1>
            <div className='bookInfoRow'>
                <img className='bookImageSquare' src={imgAddress} alt={bookId}></img>
                <span className='descriptionSpan'>{description}</span>
            </div>
            <div className='buttonRow'>
                <form onSubmit={handleSubmit} className={`inputChapterBox${chapterInput ? ' active' : ''}`}>
                    <input type="text" placeholder="Enter chapter" autoComplete="off" className={`inputChapter${chapterInput ? ' active' : ''}`}
                        value={chapterInput}
                        onChange={(e) => setChapterInput(e.target.value)}
                        ref={inputRef}
                    ></input>
                    <button type='submit' className='buttonSearch'>Go</button>
                </form>
                
                <button className='readFrom'
                    onClick={() => navigate(`/book/${title}/${bookId}/chapter/1`)}
                >Read from chapter: 1</button>
                {continueChapter !== 1 &&
                    <button className='readFrom'
                        onClick={() => navigate(`/book/${title}/${bookId}/chapter/${continueChapter}`)}
                    >Continue on chapter: {continueChapter}</button>
                }
                <button className='readFrom'
                    onClick={() => navigate(`/book/${title}/${bookId}/chapter/${totalChapters}`)}
                >Read from chapter: {totalChapters}</button>
            </div>
        </>
    )
}

export default BookLanding;