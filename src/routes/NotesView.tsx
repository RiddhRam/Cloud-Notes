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
    const [fetchedNotes, setFetchedNotes] = useState<string[]>([])

    /* Only show notes who contain the search term in their name or body */
    const filteredNotes = fetchedNotes.filter((note: string) => 
        note.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const breakString = "<CLOUD BREAK>"

    useEffect(() => {
        if (profileData == null)
            return

        fetchCloudNotes().then(notes => {

            console.log("Fetched " + notes.length + " notes");
            console.log(notes)

            //setFetchedNotes(notes)
            setFetchedNotes([`This is my title.${breakString}HI!!!`, `Good.${breakString}OK!`])
        })
    }, [])

    return (
    <div className='App-body'>

        <h1>YOUR NOTES</h1>

        {/* Search bar and create new note */}
        {/* 3 columns */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
            {/* Empty column */}
            <div style={{ flex: 1 }}></div>

            <div className='InputField' style={{ flex: 2 }}>
                <input 
                    name="search" 
                    placeholder='Search by name or content'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: "300px", margin: '0 auto'}}
                />
            </div>

            <div style={{ flex: 1 }}>
                <button>Create New Note</button>
            </div>
        </div>

        {/* Display notes */}
        <div>
            {filteredNotes.length == 0 
            ? 
            <p>No notes found</p>
            : (filteredNotes.map((note, index) => (
                <>
                    <h1>{note.split(breakString)[0]}</h1>
                    <p>{note.split(breakString)[1]}</p>
                </>
            )))}
        </div>
    </div>
    )
}