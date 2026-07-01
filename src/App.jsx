import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { useState } from 'react'

import TopBar from './TopBar.jsx'
import './App.css'
import BookLanding from './BookLanding.jsx';
import ReadingPage from './ReadingPage.jsx';
import BookSelection from './BookSelection.jsx';


function App() {

  return (
    
    <Router>
    <TopBar/>
      <main>
        <Routes>
          <Route path="/" element={<BookSelection/>} />
          <Route path="/Landing/:title/:bookId" element={<BookLanding />} />
          <Route path="/book/:title/:bookId/chapter/:chapterNum" element={<ReadingPage />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
