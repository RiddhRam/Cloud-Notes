import '../App.css'
import { ProfileData } from '../App'
import { useState, useEffect } from 'react'

type NotesData = {
    saveId: string;
    title: string;
    body: string;
}

type NotesViewProps = {
    fetchCloudNotes: () => Promise<[]>;
    createNewNote: (noteTitle: string, noteBody: string) => Promise<string>;
    editNote: (saveId: string, noteTitle: string, noteBody: string) => Promise<number>;
    deleteNote: (saveId: string) => Promise<number>;
    profileData: ProfileData;
}

export default function NotesView({ fetchCloudNotes, createNewNote, editNote, deleteNote, profileData }: NotesViewProps) {

    const [searchTerm, setSearchTerm] = useState("")
    const [fetchedNotes, setFetchedNotes] = useState<NotesData[]>([])

    const [noteSaveId, setNoteSaveId] = useState("")
    const [noteTitle, setNoteTitle] = useState("")
    const [noteBody, setNoteBody] = useState("")

    const [showModal, setShowModal] = useState(false)

    /* Only show notes which contain the search term in their title or body */
    const filteredNotes = fetchedNotes.filter(
        ({ title, body }) =>
            title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            body.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateNewNote = () => {
        setNoteSaveId("")
        setNoteTitle("")
        setNoteBody("")
        setShowModal(true)
    }

    const handleEditNote = (noteData: NotesData) => {
        setNoteSaveId(noteData.saveId)
        setNoteTitle(noteData.title)
        setNoteBody(noteData.body)

        setShowModal(true)
    }

    const handleSaveNote = async () => {
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
        if (saveId == "" || saveId == undefined) {

            // Save to cloud, returns saveId from the SQL database
            saveId = await createNewNote(title, body)

            if (saveId == "ERROR") {
                return;
            }
        } 
        // Otherwise, update the existing note
        else {
            await editNote(saveId, title, body)
        }

        const newNote: NotesData = {
            saveId: saveId,
            title: title,
            body: body
        };

        const noteIndex = fetchedNotes.findIndex(note => note.saveId == newNote.saveId)
        
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

    const handleDeleteNote = async () => {
        await deleteNote(noteSaveId);

        setFetchedNotes((prevNotes) =>
            prevNotes ? prevNotes.filter((note) => note.saveId !== noteSaveId) : []
        );

        setShowModal(false)
    }

    const handleCancel = () => {
        setShowModal(false)
    }

    useEffect(() => {
        if (profileData == null)
            return

        fetchCloudNotes().then(notes => {

            console.log("Fetched " + notes.length + " notes");
            console.log(notes)

            setFetchedNotes(notes)
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
                        {noteData.title}
                    </h2>
                    <p style={{ whiteSpace: 'nowrap', overflow: "hidden", textOverflow: "ellipsis" }}>
                        {noteData.body}
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
                            
                            {noteSaveId != "" && 
                            <button onClick={handleDeleteNote} style={{ backgroundColor: '#ed5353' }}>Delete</button>
                            }
                            
                            <button onClick={handleSaveNote} style={{ backgroundColor: "#39ff14" }}>Save</button>
                        </div>
                    </div>
                </div>
            )}
    </div>
    )
}