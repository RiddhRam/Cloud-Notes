import '../App.css'
import { ProfileData } from '../App'

type NotesViewProps = {
    onLogout: () => void;
    profileData: ProfileData;
}

export default function NotesView({ onLogout, profileData }: NotesViewProps) {
    return (
    <div className='App-body'>
        <h1>{profileData.email}</h1>
        <button onClick={onLogout}>Log Out</button>
    </div>
    )
}