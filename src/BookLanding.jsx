import { useState, useEffect, useRef } from 'react';
import "./BookLanding.css"
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';


function BookLanding() {

    const navigate = useNavigate();

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

            const savedChapter = localStorage.getItem(`book_${bookId}_last_chapter`);

            if (savedChapter) {
                setContinueChapter(parseInt(savedChapter, 10));
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
                <p>{description}</p>
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