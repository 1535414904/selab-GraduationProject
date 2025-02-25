/* eslint-disable react/prop-types */
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function EditableRow({ department, handleSave }) {
    const [editedDepartment, setEditedDepartment] = useState({
        id: department.id,
        name: department.name
    });

    const handleChange = (e) => {
        setEditedDepartment({
            ...editedDepartment,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <tr className="editable-row">
            <td><input type="text" name="nid" value={editedDepartment.id} onChange={handleChange} /></td>
            <td><input type="text" name="name" value={editedDepartment.name} onChange={handleChange} /></td>
            <td>{department.chiefSurgeonsCount}</td>
            <td>
                <FontAwesomeIcon className="edit-button" icon={faFloppyDisk}
                    onClick={() => handleSave(editedDepartment)} />
            </td>
        </tr>
    );
}

export default EditableRow;