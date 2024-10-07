import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './routes/Login';
import NotesView from './routes/NotesView';
import './App.css';
import NavBar from './components/NavBar';

function App() {

  return (
    <>
    <BrowserRouter>
      <NavBar></NavBar>
      <Routes>
        <Route>

          <Route
            path="/"
            element={
                <Login/>
            }
          ></Route>

          <Route
            path="/login"
            element={
                <Login/>
            }
          ></Route>

          <Route
            path="/notes"
            element={
                <NotesView/>
            }
          ></Route>
          
        </Route>
      </Routes>
    
    </BrowserRouter>
    </>
  );
}

export default App;
