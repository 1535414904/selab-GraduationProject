/* eslint-disable react/prop-types */
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function EditableRow({ department, handleSave }) {
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
    <tr className="bg-blue-50 hover:bg-blue-100 transition-colors duration-150">
      <td className="py-3 px-4">
        <input
          type="text"
          name="nid"
          value={editedDepartment.id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </td>
      <td className="py-3 px-4">
        <input
          type="text"
          name="name"
          value={editedDepartment.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </td>
      <td className="py-3 px-4 text-sm text-gray-800">
        {department.chiefSurgeonsCount}
      </td>
      <td className="py-3 px-4">
        <button
          onClick={() => handleSave(editedDepartment)}
          className="text-green-600 hover:text-green-800 transition-colors duration-150"
          title="儲存變更"
        >
          <FontAwesomeIcon icon={faFloppyDisk} size="lg" />
        </button>
      </td>
    </tr>
  );
}

export default EditableRow;
