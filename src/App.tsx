import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'
import Login from './routes/Login';
import NotesView from './routes/NotesView';
import './App.css';
import NavBar from './components/NavBar';

axios.defaults.withCredentials = true;

export type ProfileData = {
  email: string
}

function App() {

  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Try to sign user back in if they were signed in previously
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await axios.get('/api/profile');
        // Set user data if logged in
        setProfileData(response.data); 
      } catch (error) {
        // If the request fails it means the user is not logged in
        console.log("User not authenticated.");
        setProfileData(null);
      }
    }

    checkAuthStatus();
  }, [])

  function handleLogin(email: string, password: string, loggingIn: boolean) {
    const url = loggingIn ? '/login' : '/signup';

    axios({
      method: "POST",
      url: url,
      data: {
        email: email,
        password: password,
      },
    })
      // Successful sign in
      .then((response) => {
        setProfileData(response.data);
      })
      // Error connecting to server, or invalid credentials
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          alert(`Error: ${error.response.data.message}`);
        }
      });
  }

  function handleLogout() {
    // Call a backend endpoint that clears the httpOnly cookie from axios library
    axios({
        method: "POST",
        url: "/logout",
    })
    .then(() => {
        setProfileData(null);
    })
    .catch((error) => {
        console.error("Logout failed", error);
    });
  }

  async function fetchCloudNotes(): Promise<[]> {
    try {
      const response = await axios.get('/api/notes');
      return response.data.notes ?? [];
    } catch {
      console.log("Can't get user notes");
    }

    return [];
  }

  function createNewNote() {
    // Call a backend endpoint that clears the httpOnly cookie from axios library
    axios({
        method: "POST",
        url: "/logout",
    })
    .then(() => {
        setProfileData(null);
    })
    .catch((error) => {
        console.error("Logout failed", error);
    });
  }

  return (
    <BrowserRouter>
      <NavBar onLogout={handleLogout} profileData={profileData}></NavBar>
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
                profileData ? <NotesView fetchCloudNotes={fetchCloudNotes} createNewNote={createNewNote} profileData={profileData} /> : <Navigate to="/login" />
            }
          ></Route>
          
        </Route>
      </Routes>
    
    </BrowserRouter>
  );
}

export default App;
