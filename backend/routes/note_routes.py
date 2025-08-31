from fastapi import APIRouter, Depends, HTTPException
from typing import List
from backend.models import NoteCreate, NoteUpdate, NoteResponse
from backend.database import db, serialize_dict
from backend.dependencies import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/notes", tags=["Notes"])

@router.post("/", response_model=NoteResponse)
async def create_note(note: NoteCreate, current_user: dict = Depends(get_current_user)):
    try:
        note_dict = note.dict()
        note_dict["user_id"] = str(current_user["_id"])
        result = await db.notes.insert_one(note_dict)
        note_dict["id"] = str(result.inserted_id)
        return note_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create note: {str(e)}")

@router.get("/", response_model=List[NoteResponse])
async def get_notes(current_user: dict = Depends(get_current_user)):
    try:
        notes = []
        async for note in db.notes.find({"user_id": str(current_user["_id"])}):
            note["id"] = str(note["_id"])
            notes.append(note)
        return notes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notes: {str(e)}")

@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, update: NoteUpdate, current_user: dict = Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(note_id):
            raise HTTPException(status_code=400, detail="Invalid note ID")
            
        update_data = {k: v for k, v in update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")
            
        result = await db.notes.find_one_and_update(
            {"_id": ObjectId(note_id), "user_id": str(current_user["_id"])},
            {"$set": update_data},
            return_document=True
        )
        if not result:
            raise HTTPException(status_code=404, detail="Note not found")
        result["id"] = str(result["_id"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update note: {str(e)}")

@router.delete("/{note_id}")
async def delete_note(note_id: str, current_user: dict = Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(note_id):
            raise HTTPException(status_code=400, detail="Invalid note ID")
            
        result = await db.notes.delete_one({"_id": ObjectId(note_id), "user_id": str(current_user["_id"])})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"message": "Note deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete note: {str(e)}")
