import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChapterSelector.css';

function ChapterSelector({ currentChapter, totalChapters, title, bookId, setChapterSelector }) {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const currentRef = useRef(null);

    // Close when clicking outside the dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setChapterSelector(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setChapterSelector]);

    // Center the current chapter in the dropdown on open
    useEffect(() => {
        if (currentRef.current) {
            currentRef.current.scrollIntoView({
                block: 'center',
                inline: 'nearest',
                behavior: 'instant'
            });
        }
    }, []);

    function goTo(chapterNumber) {
        navigate(`/book/${title}/${bookId}/chapter/${chapterNumber}`);
        setChapterSelector(false);
    }

    return (
        <div className='chapterDropdown' ref={containerRef}>
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((chapterNumber) => (
                <button
                    key={chapterNumber}
                    ref={chapterNumber === currentChapter ? currentRef : null}
                    className={`dropdownItem ${chapterNumber === currentChapter ? 'activeChapter' : ''}`}
                    onClick={() => goTo(chapterNumber)}
                >
                    {chapterNumber}
                </button>
            ))}
        </div>
    );
}

export default ChapterSelector;