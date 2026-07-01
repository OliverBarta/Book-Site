import { useParams } from 'react-router-dom';
import ChapterView from './ChapterView.jsx';
import { useNavigate } from 'react-router-dom';

function ReadingPage() {

    const navigate = useNavigate();

    const { title, bookId, chapterNum } = useParams();

    return (
        <>
            <h1
                onClick={() => navigate(`/Landing/${title}/${bookId}`)}
            >{title}</h1>
            <ChapterView title={title} bookId={bookId} chapterNum={chapterNum}/>
        </>
    )
}


export default ReadingPage;