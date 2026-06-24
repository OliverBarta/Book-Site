import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ChapterView.css';

function ChapterView({ title, bookId, chapterNum}) {

    const navigate = useNavigate();

    const [totalChapters, setTotalChapters] = useState(0);
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getChapter() {
            setLoading(true);

            const { data: chapterData, error: chapterError } = await supabase
                .from('chapters')
                .select('title, content')
                .eq('book_id', bookId)
                .eq('chapter_number', chapterNum)
                .maybeSingle();

            if (chapterError) {
                console.error("Error fetching chapter data: ", chapterError.message);
            } else {
                setChapter(chapterData);
            }

            const { data: bookData, error: bookError } = await supabase
                .from('books')
                .select('total_chapters')
                .eq('id', bookId)
                .maybeSingle();
            
            if (bookError) {
                console.error("Error fetching book: ", bookError.message);
            } else {
                setTotalChapters(bookData.total_chapters);
            }

            setLoading(false);
            
        }

        getChapter();

    }, [bookId, chapterNum]);

    if (loading) return <h3>Loading chapter text...</h3>;
    if (!chapter) return <h3>Chapter not found.</h3>;

    const currentChapter = Number(chapterNum);

    const lastChapter = currentChapter >= totalChapters;



    return (
        <div>
            <div>
                <div className='chapterSelectRow'>
                    <button onClick={() => navigate(`/book/${title}/${bookId}/chapter/${currentChapter-1}`)}
                        style={{marginRight:"auto"}}
                        className='nextChapter'
                        >{"<"}</button>
                    <h3>{chapter.title}</h3>
                    {!lastChapter &&
                        <button onClick={() => navigate(`/book/${title}/${bookId}/chapter/${currentChapter+1}`)}
                            style={{marginLeft:"auto"}}
                            className='nextChapter'
                            >{">"}</button>
                    }
                    {lastChapter &&
                        <div
                            style={{marginLeft:"auto"}}
                            className='noNextChapter'
                            >{">"}</div>
                    }
                </div>
                {chapter.content.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
                <div className='chapterSelectRow'>
                    <button onClick={() => navigate(`/book/${title}/${bookId}/chapter/${currentChapter-1}`)}
                        style={{marginRight:"auto"}}
                        className='nextChapter'
                        >{"<"}</button>
                    <h3>{chapter.title}</h3>
                    {!lastChapter &&
                        <button onClick={() => navigate(`/book/${title}/${bookId}/chapter/${currentChapter+1}`)}
                            style={{marginLeft:"auto"}}
                            className='nextChapter'
                            >{">"}</button>
                    }
                    {lastChapter &&
                        <div
                            style={{marginLeft:"auto"}}
                            className='noNextChapter'
                            >{">"}</div>
                    }
                </div>

            </div>

        </div>

    )
}

export default ChapterView;