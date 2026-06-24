import './Home.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookSelection from './BookSelection.jsx';


function Home() {


    return (
        <>
            <BookSelection/>
        </>
    )
}


export default Home;