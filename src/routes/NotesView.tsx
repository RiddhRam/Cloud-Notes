import '../App.css'
import { ProfileData } from '../App'
import { useState, useEffect } from 'react'

type NotesViewProps = {
    fetchCloudNotes: () => Promise<[]>;
    createNewNote: () => void;
    profileData: ProfileData;
}

export default function NotesView({ fetchCloudNotes, createNewNote, profileData }: NotesViewProps) {

    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        if (profileData == null)
            return

        fetchCloudNotes().then(notes => {
            console.log("Fetched " + notes.length + " notes");
            console.log(notes)
        })
    }, [])

    return (
    <div className='App-body'>

        <h1>YOUR NOTES</h1>

        {/* Search bar and create new note */}
        <div className='InputField'>
            <input 
                name="search" 
                placeholder='Search by name'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
    </div>
    )
}