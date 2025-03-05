import '../App.css'
import { ProfileData } from '../App'
import { useState, useEffect } from 'react'

type NotesViewProps = {
    fetchCloudNotes: () => Promise<[]>;
    createNewNote: () => void;
    profileData: ProfileData;
}

type NotesData = {
    saveId: string;
    note: string;
}

export default function NotesView({ fetchCloudNotes, createNewNote, profileData }: NotesViewProps) {

    const [searchTerm, setSearchTerm] = useState("")
    const [fetchedNotes, setFetchedNotes] = useState<NotesData[]>([])

    const [noteSaveId, setNoteSaveId] = useState("")
    const [noteTitle, setNoteTitle] = useState("")
    const [noteBody, setNoteBody] = useState("")

    const [showModal, setShowModal] = useState(false)
    

    /* Only show notes who contain the search term in their name or body */
    const filteredNotes = fetchedNotes.filter(({ note }) => 
        note.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateNewNote = () => {
        setNoteSaveId("")
        setNoteTitle("")
        setNoteBody("")
        setShowModal(true)
    }

    const handleEditNote = (noteData: NotesData) => {
        const splitArray = noteData.note.split(breakString);

        setNoteSaveId(noteData.saveId)
        setNoteTitle(splitArray[0])
        setNoteBody(splitArray[1])

        setShowModal(true)
    }

    const handleSaveNote = () => {
        let title = noteTitle
        let body = noteBody

        if (title == "") {
            title = "No Title"
        }
        if (body == "") {
            body = "No Body"
        }

        let saveId = noteSaveId;

        // If no saveId, this is a new note and needs to be added to the database
        if (saveId == "") {
            // Save to cloud, returns saveId from the SQL database
            //saveId = createNewNote(title, body)
            saveId = ""
        }

        const newNote: NotesData = {
            saveId,
            note: `${title}${breakString}${body}`
        };

        const noteIndex = fetchedNotes.findIndex(n => n.saveId == saveId)
        
        // Update existing note if already in fetchedNotes
        if (noteIndex != -1) {
            const updatedNotes = fetchedNotes;
            updatedNotes[noteIndex] = newNote;
            setFetchedNotes(updatedNotes);
        }
        // Otherwise, add it to the end
        else {
            setFetchedNotes(prev => [...prev, newNote])
        }
            
        setShowModal(false)
    }

    const handleCancel = () => {
        setShowModal(false)
    }

    const breakString = "<CLOUD BREAK>"

    useEffect(() => {
        if (profileData == null)
            return

        fetchCloudNotes().then(notes => {

            console.log("Fetched " + notes.length + " notes");
            console.log(notes)

            const formattedNotes: NotesData[] = [
                {saveId: '1', note: `This is my title.${breakString}HI!!!`},
                {saveId: '2', note: `Good.${breakString}WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW`},
                {saveId: '3', note: `Good.${breakString}WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW`},
                {saveId: '4', note: `Good.${breakString}WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW`},
                {saveId: '5', note: `Good.${breakString}WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW`},
                {saveId: '6', note: `Good.${breakString}WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW`},
                {saveId: '7', note: `Good.${breakString}WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW`},
            ]

            //setFetchedNotes(notes)
            setFetchedNotes(formattedNotes)
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
                <button onClick={handleCreateNewNote} style={{ backgroundColor: "#39ff14", filter: "drop-shadow(0 0 0.5rem black)" }}>Create New Note</button>
            </div>
        </div>

        {/* Display notes */}
        <div style={{ display: 'flex', flexWrap: "wrap", justifyContent: "center", alignItems: 'stretch', gap: '30px', marginTop: '40px' }}>
            {filteredNotes.length == 0 
            ? 
            <p>No notes found</p>
            : (filteredNotes.map((noteData, index) => (
                <button onClick={() => handleEditNote(noteData)} key={index} style={{ maxWidth: '350px', textAlign: 'start', filter: "drop-shadow(0 0 0.5rem black)" }}>
                    <h2 style={{ whiteSpace: 'nowrap', overflow: "hidden", textOverflow: "ellipsis"}}>
                        {noteData.note.split(breakString)[0]}
                    </h2>
                    <p style={{ whiteSpace: 'nowrap', overflow: "hidden", textOverflow: "ellipsis" }}>
                        {noteData.note.split(breakString)[1]}
                    </p>
                </button>
            )))}
        </div>

        {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div 
                    className='InputField'
                    style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        width: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <h4 style={{display: 'flex', justifyContent: 'center', color: 'black', margin: '0'}}>Note Editor</h4>

                        <input 
                            placeholder="Title"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            style={{margin: "20px 0", padding: '5px'}}
                        />

                        <textarea
                            placeholder="Body"
                            value={noteBody}
                            onChange={(e) => setNoteBody(e.target.value)}
                            rows={10}
                            style={{margin: "20px 0", padding: '5px'}}
                        />

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
                            <button onClick={handleCancel} style={{ backgroundColor: '#adadadff' }}>Cancel</button>
                            <button onClick={handleCancel} style={{ backgroundColor: '#ed5353' }}>Delete</button>
                            <button onClick={handleSaveNote} style={{ backgroundColor: "#39ff14" }}>Save</button>
                        </div>
                    </div>
                </div>
            )}
    </div>
    )
}