import '../App.css'
import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <div className='Navbar'>
            <div className='App-title'>
                <Link to="/" className='NavbarText'>
                    <h1 style={{color: "#5fdbfb"}}>🗒️ Cloud Notes</h1>
                </Link>
            </div>

            <div className='Navbar-links'>
                <Link to="/" className='NavbarText'>
                    <p>Home</p>
                </Link>

                <Link to="/notes" className='NavbarText'>
                    <p>Notes</p>
                </Link>
            </div>
        </div>
    )
}