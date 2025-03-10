/* eslint-disable react/prop-types */
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function EditableRow({ key, department, handleSave }) {
  const [editedDepartment, setEditedDepartment] = useState({
    id: department.id,
    name: department.name,
  });

  const handleChange = (e) => {
    setEditedDepartment({
      ...editedDepartment,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <tr key={key} className="editable-row">
      <td>455</td>
      <td>
        <input
          type="text"
          name="id"
          value={editedDepartment.id}
          onChange={handleChange}
        />
      </td>
      <td>
        <input
          type="text"
          name="name"
          value={editedDepartment.name}
          onChange={handleChange}
        />
      </td>
      <td>
        {department.chiefSurgeonsCount}
      </td>
      <td><FontAwesomeIcon icon={faFloppyDisk} className="edit-button" onClick={() => handleSave(editedDepartment)} /></td>
    </tr>
  );
}

export default EditableRow;
