/* eslint-disable react/prop-types */
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function EditableRow({ key, chiefSurgeon, handleSave }) {
    const [editedChiefSurgeon, setEditedChiefSurgeon] = useState({
        id: chiefSurgeon.id,
        name: chiefSurgeon.name
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setEditedChiefSurgeon({
            ...editedChiefSurgeon,
            [e.target.name]: e.target.value,
        });
    };

    const handleSaveClick = () => {
        if (!editedChiefSurgeon.id.trim()) {
            setError("員工編號不能為空");
        } else {
            setError(null);
            handleSave(editedChiefSurgeon);
        }
    };


    return (
        <tr key={key} className="editable-row">
            <td>
                <input type="text" name="id" value={editedChiefSurgeon.id} onChange={handleChange} />
                <p className="error">{error}</p>
            </td>
            <td><input type="text" name="name" value={editedChiefSurgeon.name} onChange={handleChange} /></td>
            <td>
                <FontAwesomeIcon className="edit-button" icon={faFloppyDisk}
                    onClick={handleSaveClick} />
            </td>
        </tr>
    );
}

export default EditableRow;