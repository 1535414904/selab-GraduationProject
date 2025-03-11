/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons";

function AddRow({ addOperatingRooms, setAddOperatingRooms, handleAdd, emptyError }) {
    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const updated = [...addOperatingRooms];
        updated[index][name] = value;
        setAddOperatingRooms(updated);
    };
    const [departments, setDepartments] = useState([]);

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

    const handleDelete = (index) => {
        const updated = addOperatingRooms.filter((department, idx) => idx !== index);
        setAddOperatingRooms(updated);
    };

    return (
        <>
            {addOperatingRooms.map((operatingRoom, index) => (
                <tr className="editable-row" key={index}>
                    <td></td>
                    <td>
                        <input
                            type="text"
                            name="id"
                            value={operatingRoom.id}
                            onChange={(e) => handleChange(index, e)}
                            placeholder="請輸入手術房編號"
                        />
                        <div className="error">{emptyError}</div>
                    </td>
                    <td>
                        <input
                            type="text"
                            name="name"
                            value={operatingRoom.name}
                            onChange={(e) => handleChange(index, e)}
                        />
                    </td>
                    <td>
                        <select
                            name="departmentId"
                            value={operatingRoom.departmentId}
                            onChange={(e) => handleChange(index, e)}
                        >
                            {departments.map((department) => (
                                <option key={department.id} value={department.id}>
                                    {department.name}
                                </option>
                            ))}
                        </select>
                    </td>
                    <td>
                        <input
                            type="text"
                            name="roomType"
                            value={operatingRoom.roomType}
                            onChange={(e) => handleChange(index, e)}
                        />
                    </td>
                    <td>
                        <select
                            name="status"
                            value={operatingRoom.status}
                            onChange={(e) => handleChange(index, e)}
                        >
                            <option value={1}>開啟</option>
                            <option value={0}>關閉</option>
                        </select>
                    </td>
                    <td>
                        <div className="action-buttons">
                            <FontAwesomeIcon className="edit-button" icon={faFloppyDisk} onClick={() => {
                                handleAdd(operatingRoom);
                                if (operatingRoom.id.trim()) { handleDelete(index); }
                            }} />
                            <FontAwesomeIcon className="delete-button" icon={faTrash} onClick={() => handleDelete(index)} />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    )
}

export default AddRow;