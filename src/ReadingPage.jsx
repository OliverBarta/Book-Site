import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ChapterView from './ChapterView.jsx';
import CommentSection from './ComentSection.jsx';
import { useAuth } from './hooks/useAuth.jsx';





function ReadingPage() {

    const navigate = useNavigate();

    const { session } = useAuth();

    const { title, bookId, chapterNum } = useParams();

    return (
        <>
            <h1
                onClick={() => navigate(`/Landing/${title}/${bookId}`)}
            >{title}</h1>
            <ChapterView title={title} bookId={bookId} chapterNum={chapterNum}/>
            <CommentSection bookId={bookId} chapterNum={chapterNum} session={session} />
        </>
    )
}


export default ReadingPage;