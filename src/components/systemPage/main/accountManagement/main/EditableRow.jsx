/* eslint-disable react/prop-types */
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function EditableRow({ key, user, handleSave }) {
    const [editedUser, setEditedUser] = useState({
        username: user.username,
        name: user.name,
        unit: user.unit,
        role: user.role,
        email: user.email,
    });

    const handleChange = (e) => {
        setEditedUser({
            ...editedUser,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <tr key={key} className="editable-row">
            <td>{editedUser.username}</td>
            <td><input type="text" name="name" value={editedUser.name} onChange={handleChange} /></td>
            <td><input type="text" name="unit" value={editedUser.unit} onChange={handleChange} /></td>
            <td>
                <select name="role" value={editedUser.role} onChange={handleChange}>
                    <option value={1}>查看者</option>
                    <option value={2}>編輯者</option>
                    <option value={3}>管理者</option>
                </select>
            </td>
            <td><input type="text" name="email" value={editedUser.email} onChange={handleChange} /></td>
            <td>
                <FontAwesomeIcon className="edit-button" icon={faFloppyDisk}
                    onClick={() => handleSave(editedUser)} />
            </td>
        </tr>
    );
}

export default EditableRow;