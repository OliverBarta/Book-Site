import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import TopBar from './TopBar.jsx'
import './App.css'
import BookLanding from './BookLanding.jsx';
import ReadingPage from './ReadingPage.jsx';
import BookSelection from './BookSelection.jsx';
import LoginPage from './LoginPage.jsx';
import { FavouriteSectionProvider } from './hooks/useFavouriteSection.jsx';
import { AuthProvider } from './hooks/useAuth.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FavouriteSectionProvider>
          <TopBar/>
          <main>
            <Routes>
              <Route path="/" element={<BookSelection/>} />
              <Route path="/Landing/:title/:bookId" element={<BookLanding />} />
              <Route path="/book/:title/:bookId/chapter/:chapterNum" element={<ReadingPage />} />
              <Route path="/Login" element={<LoginPage />} />
            </Routes>
          </main>
        </FavouriteSectionProvider>
      </AuthProvider>
    </Router>
  )
}

export default App