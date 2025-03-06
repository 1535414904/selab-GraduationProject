/* eslint-disable react/prop-types */
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";

function EditableRow({ key, operatingRoom, handleSave }) {
    const [editedOperatingRoom, setEditedOperatingRoom] = useState({
        id: operatingRoom.id,
        name: operatingRoom.name,
        departmentId: operatingRoom.department.id,
        roomType: operatingRoom.roomType,
        status: operatingRoom.status
    });
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        console.log(editedOperatingRoom);
    },[editedOperatingRoom])

    const handleChange = (e) => {
        setEditedOperatingRoom({
            ...editedOperatingRoom,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveClick = () => {
        if (!editedOperatingRoom.id.trim()) {
            setError("手術房編號不能為空");
        } else {
            setError(null);
            handleSave(editedOperatingRoom);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(BASE_URL + "/api/system/departments");
                setDepartments(response.data);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchData();
    }, []);

    return (
        <tr key={key} className="editable-row">
            <td>
                <input type="text" name="id" value={editedOperatingRoom.id}
                    onChange={handleChange} />
                <p className="error">{error}</p>
            </td>
            <td><input type="text" name="name" value={editedOperatingRoom.name}
                onChange={handleChange} /></td>
            <td>
                <select
                    name="departmentId"
                    value={editedOperatingRoom.departmentId}
                    onChange={handleChange}
                >
                    {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                            {department.name}
                        </option>
                    ))}
                </select>
            </td>
            <td><input type="text" name="roomType" value={editedOperatingRoom.roomType}
                onChange={handleChange} /></td>
            <td>
                <select name="status" value={editedOperatingRoom.status}
                onChange={handleChange}>
                    <option value={0}>關閉</option>
                    <option value={1}>開啟</option>
                </select>
            </td>
            <td>
                <FontAwesomeIcon className="edit-button" icon={faFloppyDisk}
                    onClick={handleSaveClick} />
            </td>
        </tr>
    )
}

export default EditableRow;