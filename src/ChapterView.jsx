import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import ChapterSelector from './ChapterSelector';
import FontSizeMenu from './FontSizeMenu';
import './ChapterView.css';
import { openDB } from 'idb';

const dbPromise = openDB('chapter-store', 1, {
    upgrade(db) {
        db.createObjectStore('chapters', { keyPath: 'id' });
    },
});

const PREFETCH_AHEAD = 100;

function cacheKey(bookId, chapterNumber) {
    return `${bookId}-${chapterNumber}`;
}

async function getCachedChapter(bookId, chapterNumber) {
    const db = await dbPromise;
    return db.get('chapters', cacheKey(bookId, chapterNumber));
}

async function setCachedChapter(bookId, chapterNumber, title, content) {
    const db = await dbPromise;
    await db.put('chapters', {
        id: cacheKey(bookId, chapterNumber),
        bookId,
        chapterNumber,
        title,
        content,
    });
}

async function fetchChapterFromSupabase(bookId, chapterNumber) {
    const { data, error } = await supabase
        .from('chapters')
        .select('title, content')
        .eq('book_id', bookId)
        .eq('chapter_number', chapterNumber)
        .maybeSingle();
    if (error) throw error;
    return data;
}

async function prefetchChapters(bookId, currentChapter, totalChapters) {
    if (!totalChapters) return;
    const chaptersToFetch = Math.min(PREFETCH_AHEAD, totalChapters - currentChapter);
    for (let i = 1; i <= chaptersToFetch; i++) {
        const chapterNumber = currentChapter + i;
        try {
            const cached = await getCachedChapter(bookId, chapterNumber);
            if (!cached) {
                const data = await fetchChapterFromSupabase(bookId, chapterNumber);
                if (data) {
                    await setCachedChapter(bookId, chapterNumber, data.title, data.content);
                }
            }
        } catch (err) {
            console.error(`Prefetch failed for chapter ${chapterNumber}:`, err.message);
        }
    }
}

function ChapterView({ title, bookId, chapterNum }) {
    const navigate = useNavigate();
    const currentChapter = Number(chapterNum);

    const [totalChapters, setTotalChapters] = useState(0);
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chapterSelector, setChapterSelector] = useState(false);

    // Load current chapter (cache-first) + book metadata
    useEffect(() => {
        let cancelled = false;

        async function loadChapter() {
            setLoading(true);
            try {
                const cached = await getCachedChapter(bookId, currentChapter);
                if (cached) {
                    if (!cancelled) setChapter({ title: cached.title, content: cached.content });
                } else {
                    const data = await fetchChapterFromSupabase(bookId, currentChapter);
                    if (!cancelled) setChapter(data);
                    if (data) {
                        setCachedChapter(bookId, currentChapter, data.title, data.content);
                    }
                }

                const { data: bookData, error: bookError } = await supabase
                    .from('books')
                    .select('total_chapters')
                    .eq('id', bookId)
                    .maybeSingle();

                if (bookError) {
                    console.error('Error fetching book:', bookError.message);
                } else if (!cancelled) {
                    setTotalChapters(bookData?.total_chapters ?? 0);
                }
            } catch (err) {
                console.error('Error loading chapter:', err.message);
                if (!cancelled) setChapter(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadChapter();
        return () => {
            cancelled = true;
        };
    }, [bookId, currentChapter]);

    useEffect(() => {
        if (totalChapters > 0) {
            prefetchChapters(bookId, currentChapter, totalChapters);
        }
    }, [bookId, currentChapter, totalChapters]);

    useEffect(() => {
        if (bookId && currentChapter) {
            localStorage.setItem(`book_${bookId}_last_chapter`, currentChapter);
        }
    }, [bookId, currentChapter]);

    if (loading) return <h3>Loading chapter text...</h3>;
    if (!chapter) return <h3>Chapter not found.</h3>;

    const lastChapter = currentChapter >= totalChapters;

    return (
        <div>
            <div className='fontMenuRow' style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: "15px" }}>
                <FontSizeMenu />
            </div>
            <div className='chapterSelectRow'>
                {currentChapter != 1 &&
                    <button onClick={() => navigate(`/book/${title}/${bookId}/chapter/${currentChapter - 1}`)}
                        style={{ marginRight: "auto" }}
                        className='nextChapter'
                    >{"<"}</button>
                }
                {currentChapter == 1 &&
                    <div
                        style={{ marginRight: "auto" }}
                        className='noNextChapter'
                    >{"<"}</div>
                }
                <div style={{ position: "relative" }}>
                    <button onClick={() => setChapterSelector(prev => !prev)}
                        className='chapterTitle'
                    ><h3>{chapter.title}</h3></button>
                    {chapterSelector &&
                        <ChapterSelector
                            currentChapter={currentChapter}
                            totalChapters={totalChapters}
                            title={title}
                            bookId={bookId}
                            setChapterSelector={setChapterSelector}
                        />
                    }
                </div>

                {!lastChapter &&
                    <button onClick={() => navigate(`/book/${title}/${bookId}/chapter/${currentChapter + 1}`)}
                        style={{ marginLeft: "auto" }}
                        className='nextChapter'
                    >{">"}</button>
                }
                {lastChapter &&
                    <div
                        style={{ marginLeft: "auto" }}
                        className='noNextChapter'
                    >{">"}</div>
                }
            </div>
            {chapter.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
            <div className='chapterSelectRow'>
                <button onClick={() => navigate(`/book/${title}/${bookId}/chapter/${currentChapter - 1}`)}
                    style={{ marginRight: "auto" }}
                    className='nextChapter'
                >{"<"}</button>

                <button onClick={() => setChapterSelector(true)}
                    className='chapterTitle'
                ><h3>{chapter.title}</h3></button>

                {!lastChapter &&
                    <button onClick={() => navigate(`/book/${title}/${bookId}/chapter/${currentChapter + 1}`)}
                        style={{ marginLeft: "auto" }}
                        className='nextChapter'
                    >{">"}</button>
                }
                {lastChapter &&
                    <div
                        style={{ marginLeft: "auto" }}
                        className='noNextChapter'
                    >{">"}</div>
                }
            </div>
        </div>
    )
}
export default ChapterView;