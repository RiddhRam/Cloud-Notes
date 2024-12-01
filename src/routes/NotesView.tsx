import '../App.css'
import { ProfileData } from '../App'
import { useState, useEffect } from 'react'

type NotesViewProps = {
    fetchCloudNotes: () => void;
    createNewNote: () => void;
}

export default function NotesView({ fetchCloudNotes, createNewNote }: NotesViewProps) {

    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchCloudNotes();
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