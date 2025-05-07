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
  id: string
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

  async function createNewNote(noteTitle: string, noteBody: string): Promise<string> {
    try {
      const response = await axios.post("/createNewNote", {
        title: noteTitle,
        body: noteBody
      });

      return response.data.id;
    } catch (error) {
      console.error("Create note failed", error);
      return "ERROR";
    }
  }

  async function editNote(saveId: string, noteTitle: string, noteBody: string): Promise<number> {
    try {
      const response = await axios.post("/editNote", {
        id: saveId,
        title: noteTitle,
        body: noteBody
      });

      return response.status;
    } catch (error) {
      console.error("Edit note failed", error);
      return 400;
    }
  }

  async function deleteNote(saveId: string): Promise<number> {
    try {
      const response = await axios.post("/deleteNote", {
        id: saveId,
      });

      return response.status;
    } catch (error) {
      console.error("Delete note failed", error);
      return 400;
    }
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
                profileData ? 
                <NotesView 
                fetchCloudNotes={fetchCloudNotes} 
                createNewNote={createNewNote} 
                editNote={editNote} 
                deleteNote={deleteNote}
                profileData={profileData} /> : <Navigate to="/login" />
            }
          ></Route>
          
        </Route>
      </Routes>
    
    </BrowserRouter>
  );
}

export default App;
