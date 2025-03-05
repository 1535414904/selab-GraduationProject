import { useState } from "react";

function EditableRow({ key, operatingRoom, handleSave }) {
    const [editedOperatingRoom, setEditedOperatingRoom] = useState({
        id: operatingRoom.id,
        name: operatingRoom.name,
        roomType: operatingRoom.roomType,
        status: operatingRoom.status
    });

    const handleChange = (e) => {
        setEditedOperatingRoom({
            ...editedOperatingRoom,
            [e.target.name]: e.target.value
        });
    };

    return (
        <tr key={key} className="editable-row">
            <td>
                
            </td>
        </tr>
    )
}

export default EditableRow;