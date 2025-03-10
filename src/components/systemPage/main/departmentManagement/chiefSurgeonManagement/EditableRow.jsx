import { useState } from "react";

function EditableRow({ key, chiefSurgeon , handleSave }) {
    const [editedChiefSurgeon, setEditedChiefSurgeon] = useState({
        id: chiefSurgeon.id,
        name: chiefSurgeon.name,
    });

    const handleChange = (e) => {
        setEditedChiefSurgeon({
        ...editedChiefSurgeon,
        [e.target.name]: e.target.value,
        });
    };

    <tr key={key} className="editable-row">
        <td></td>
        <td>
            <input 
                type="text"
                name="id"
                value={editedChiefSurgeon.id}
                onChange={handleChange}
            />
        </td>
        <td>
            <input 
                type="text"
                name="name"
                value={editedChiefSurgeon.name}
                onChange={handleChange}
            />
        </td>
    </tr>
}

export default EditableRow;