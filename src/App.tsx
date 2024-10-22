import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios'
import Login from './routes/Login';
import NotesView from './routes/NotesView';
import './App.css';
import NavBar from './components/NavBar';

interface ProfileData {
  profile_name: string
  about_me: string
}

function App() {

  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  function handleLogin() {
    axios({
      method: "GET",
      url: "/profile",
    })
      .then((response) => {
        const res = response.data;
        setProfileData({
          profile_name: res.name,
          about_me: res.about,
        });
        // After successful login, the routes below will automatically redirect.
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }

  function handleLogout() {
    setProfileData(null);
  }

  return (
    <>
    <BrowserRouter>
      <NavBar></NavBar>
      <Routes>
        <Route>

          <Route
            path="/"
            element={
                !profileData ? <Navigate to="/login" /> : <Navigate to="/notes" />
            }
          ></Route>

          <Route
            path="/login"
            element={
                !profileData ? <Login onLogin={handleLogin} /> : <Navigate to="/notes" />
            }
          ></Route>

          <Route
            path="/notes"
            element={
                profileData ? <NotesView onLogout={handleLogout}/> : <Navigate to="/login" />
            }
          ></Route>
          
        </Route>
      </Routes>
    
    </BrowserRouter>
    </>
  );
}

export default App;
