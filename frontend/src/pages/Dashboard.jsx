import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
    const { token, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: "", content: "" });
    const [editingNote, setEditingNote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch notes on mount
    useEffect(() => {
        if (token) {
            fetchNotes();
        }
    }, [token]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const res = await API.get("/notes/");
            setNotes(res.data);
            setError("");
        } catch (err) {
            console.error("Error fetching notes:", err);
            setError("Failed to fetch notes");
        } finally {
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Create new note
    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.title.trim() || !newNote.content.trim()) {
            setError("Please fill in both title and content");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // Debug: Check token before making request
            const token = localStorage.getItem("token");
            console.log("Token before POST request:", token ? token.substring(0, 20) + "..." : "No token");

            const res = await API.post("/notes/", newNote);
            console.log("Note created successfully:", res.data);

            setNotes([...notes, res.data]);
            setNewNote({ title: "", content: "" });
        } catch (err) {
            console.error("Error creating note:", err);
            if (err.response?.status === 401) {
                setError("Authentication failed. Please login again.");
                // Redirect to login on authentication failure
                handleLogout();
            } else {
                setError("Failed to create note. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Start editing note
    const startEditNote = (note) => {
        setEditingNote({ ...note });
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingNote(null);
    };

    // Update note
    const handleUpdateNote = async (e) => {
        e.preventDefault();
        if (!editingNote.title.trim() || !editingNote.content.trim()) {
            setError("Please fill in both title and content");
            return;
        }

        try {
            setLoading(true);
            const res = await API.put(`/notes/${editingNote.id}`, {
                title: editingNote.title,
                content: editingNote.content
            });
            setNotes(notes.map((n) => n.id === editingNote.id ? res.data : n));
            setEditingNote(null);
            setError("");
        } catch (err) {
            console.error("Error updating note:", err);
            setError("Failed to update note");
        } finally {
            setLoading(false);
        }
    };

    // Delete note
    const handleDeleteNote = async (id) => {
        if (!window.confirm("Are you sure you want to delete this note?")) {
            return;
        }

        try {
            setLoading(true);
            await API.delete(`/notes/${id}`);
            setNotes(notes.filter((n) => n.id !== id));
            setError("");
        } catch (err) {
            console.error("Error deleting note:", err);
            setError("Failed to delete note");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">My Notes</h2>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Create Note Form */}
                    <form onSubmit={handleAddNote} className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">Create New Note</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Note Title"
                                value={newNote.title}
                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Note Content"
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            {loading ? "Creating..." : "Add Note"}
                        </button>
                    </form>

                    {/* Notes List */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">Your Notes</h3>
                        {loading && notes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Loading notes...</div>
                        ) : notes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No notes yet. Create your first note above!</div>
                        ) : (
                            <div className="space-y-4">
                                {notes.map((note) => (
                                    <div key={note.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        {editingNote && editingNote.id === note.id ? (
                                            // Edit Form
                                            <form onSubmit={handleUpdateNote}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <input
                                                        type="text"
                                                        value={editingNote.title}
                                                        onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editingNote.content}
                                                        onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                    >
                                                        {loading ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEdit}
                                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            // Display Note
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold text-gray-800">{note.title}</h4>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEditNote(note)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            disabled={loading}
                                                            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600">{note.content}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
