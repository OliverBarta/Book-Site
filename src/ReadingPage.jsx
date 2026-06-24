import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChapterView from './ChapterView.jsx';


function ReadingPage() {

    const { title, bookId, chapterNum } = useParams();

    return (
        <>
            <h1>{title}</h1>
            <ChapterView title={title} bookId={bookId} chapterNum={chapterNum}/>
        </>
    )
}


export default ReadingPage;