/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import { faPenSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import EditableRow from "./EditableRow";
import axios from "axios";
import { BASE_URL } from "../../../../../config";
import AddRow from "./AddRow";

function ORListWrapper({
    operatingRooms, setOperatingRooms,
    filterOperatingRoom, selectedOperatingRooms,
    setSelectedOperatingRooms, handleDelete,
    addOperatingRooms, setAddOperatingRooms,
    handleAdd, emptyError, setEditingUser }) {

    const [filteredOperatingRooms, setFilteredOperatingRooms] = useState([]);
    const [editingOperatingRoom, setEditingOperatingRoom] = useState(null);

    const statusDisplayMap = {
        1: <td>開啟</td>,
        0: <td>關閉</td>,
    };

    useEffect(() => {
        if (!operatingRooms.length) return;

        const newFilteredOperatingRooms = operatingRooms.filter((operatingRoom) => {
            const matchesId = filterOperatingRoom.id
                ? operatingRoom.id
                    .toLowerCase()
                    .includes(filterOperatingRoom.id.toLowerCase())
                : true;
            const matchesName = filterOperatingRoom.name
                ? operatingRoom.name


                    .toLowerCase()
                    .includes(filterOperatingRoom.name.toLowerCase())
                : true;

            return matchesId && matchesName;
        });

        const sortedOperatingRooms = newFilteredOperatingRooms.sort(
            (a, b) => b.role - a.role
        );

        setFilteredOperatingRooms(sortedOperatingRooms);
    }, [filterOperatingRoom.id, filterOperatingRoom.name, operatingRooms, setOperatingRooms]);

    const handleEdit = (operatingRoom) => {
        setEditingOperatingRoom(operatingRoom);
    };

    const handleSave = async (updatedOperatingRoom) => {
        try {
            await axios.put(
                `${BASE_URL}/api/system/operating-room/${updatedOperatingRoom.id}`,
                updatedOperatingRoom
            );
            const response = await axios.get(`${BASE_URL}/api/system/operating-rooms`);
            setOperatingRooms(response.data);
            setEditingOperatingRoom(null);
        } catch (error) {
            console.error("updated error：", error);
        }
    };


    const handleCheckboxChange = (id) => {
        setSelectedOperatingRooms((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter(operatingRoom => operatingRoom != id)
                : [...prevSelected, id])
    }

    return (
        <div className="mgr-list">
            <table className="system-table">
                <thead>
                    <tr>
                        <th>選取</th>
                        <th>手術房編號</th>
                        <th>手術房名稱</th>
                        <th>所屬科別</th>
                        <th>手術房種類</th>
                        <th>手術房狀態</th>
                        <th>動作</th>
                    </tr>
                </thead>
                <tbody>
                    <AddRow
                        addOperatingRooms={addOperatingRooms}
                        setAddOperatingRooms={setAddOperatingRooms}
                        handleAdd={handleAdd}
                        emptyError={emptyError}
                    />
                    {filteredOperatingRooms.length > 0 ? (
                        filteredOperatingRooms.map((operatingRoom) => (
                            editingOperatingRoom?.id === operatingRoom.id ? (
                                <EditableRow
                                    key={operatingRoom.id}
                                    operatingRoom={operatingRoom}
                                    handleSave={handleSave}
                                    setIsEditing={setEditingOperatingRoom} // 傳遞 setEditingUser 來控制編輯模式
                                />
                            ) : (
                                <tr key={operatingRoom.id}>
                                    {/* <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedOperatingRooms.includes(operatingRoom.id)}
                                            onChange={() => handleCheckboxChange(operatingRoom.id)}
                                        />
                                    </td> */}
                                    <td
                                        onClick={() => handleCheckboxChange(operatingRoom.id)}
                                        className={`selectable-cell ${selectedOperatingRooms.includes(operatingRoom.id) ? "selected" : ""}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedOperatingRooms.includes(operatingRoom.id)}
                                            onClick={(e) => e.stopPropagation()} // 防止 `td` 的 `onClick` 影響 `input`
                                            onChange={() => handleCheckboxChange(operatingRoom.id)}
                                            className="checkbox"
                                        />
                                    </td>

                                    <td>{operatingRoom.id}</td>
                                    <td>{operatingRoom.name}</td>
                                    <td>{operatingRoom.department.name}</td>
                                    <td>{operatingRoom.roomType}</td>
                                    {statusDisplayMap[operatingRoom.status]}
                                    {/* <td>
                                        <div className="action-buttons">
                                            <FontAwesomeIcon className="edit-button" icon={faPenSquare} onClick={() => handleEdit(operatingRoom)} />
                                            <FontAwesomeIcon className="delete-button" icon={faTrash} onClick={() => handleDelete(operatingRoom.id)} />
                                        </div>
                                    </td> */}
                                    <td>
                                        <div className="action-buttons">
                                            {/* 編輯按鈕 */}
                                            <button onClick={() => handleEdit(operatingRoom)} className="action-button edit-button">
                                                <FontAwesomeIcon icon={faPenSquare} className="action-icon" />
                                            </button>

                                            {/* 刪除按鈕 */}
                                            <button onClick={() => handleDelete(operatingRoom.name, operatingRoom.id)} className="action-button delete-button">
                                                <FontAwesomeIcon icon={faTrash} className="action-icon" />
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            )
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="6"
                                className="py-4 px-4 text-center text-gray-500 italic"
                            >
                                無符合條件的資料
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default ORListWrapper;