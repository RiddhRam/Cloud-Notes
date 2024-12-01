import { ProfileData } from '../App';
import '../App.css'
import { Link } from "react-router-dom";

type NavbarProps = {
    onLogout: () => void;
    profileData: ProfileData | null;
}

export default function NavBar({ onLogout, profileData }: NavbarProps) {
    return (
        <div className='Navbar'>
            <div className='App-title'>
                <Link to="/" className='NavbarText'>
                    <h1 style={{color: "#5fdbfb"}}>🗒️ Cloud Notes</h1>
                </Link>
            </div>

            {/* Log Out */}
            {profileData && 
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '20px', justifyContent: "center" }}>
                <p style={{fontSize: "20px", color: 'white'}}>{profileData.email}</p>
                <button onClick={onLogout} style={{fontSize: "15px", backgroundColor: '#ed5353'}}>Log Out</button>
            </div>
            }
        </div>
    )
}