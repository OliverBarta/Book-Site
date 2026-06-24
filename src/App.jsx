import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { useState } from 'react'

import TopBar from './TopBar.jsx'
import './App.css'
import Home from './home.jsx';
import ReadingPage from './ReadingPage.jsx';


function App() {

  return (
    
    <Router>
    <TopBar/>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:title/:bookId/chapter/:chapterNum" element={<ReadingPage />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
