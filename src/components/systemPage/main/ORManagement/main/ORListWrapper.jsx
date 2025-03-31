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
    handleAdd, emptyError, setEmptyError
}) {
    const [filteredOperatingRooms, setFilteredOperatingRooms] = useState([]);
    const [editingOperatingRoom, setEditingOperatingRoom] = useState(null);

    // 顯示狀態的文字
    const statusDisplayMap = {
        1: "開啟",
        0: "關閉",
    };

    // 根據 filterOperatingRoom 中的所有條件進行過濾
    useEffect(() => {
        if (!operatingRooms.length) return;

        const newFilteredOperatingRooms = operatingRooms.filter((operatingRoom) => {
            const matchesId = filterOperatingRoom.id
                ? operatingRoom.id.toLowerCase().includes(filterOperatingRoom.id.toLowerCase())
                : true;
            const matchesName = filterOperatingRoom.name
                ? operatingRoom.name.toLowerCase().includes(filterOperatingRoom.name.toLowerCase())
                : true;
            const matchesDepartment = filterOperatingRoom.department
                ? operatingRoom.department.name.toLowerCase().includes(filterOperatingRoom.department.toLowerCase())
                : true;
            const matchesRoomType = filterOperatingRoom.roomType
                ? operatingRoom.roomType === filterOperatingRoom.roomType
                : true;
            const matchesStatus = filterOperatingRoom.status
                ? operatingRoom.status.toString() === filterOperatingRoom.status
                : true;

            return matchesId && matchesName && matchesDepartment && matchesRoomType && matchesStatus;
        });

        setFilteredOperatingRooms(newFilteredOperatingRooms);
    }, [
        filterOperatingRoom.id,
        filterOperatingRoom.name,
        filterOperatingRoom.department,
        filterOperatingRoom.roomType,
        filterOperatingRoom.status,
        operatingRooms
    ]);

    const handleEdit = async (operatingRoom) => {
        try {
            // 向 API 查詢該手術房是否包含手術
            const response = await axios.get(`${BASE_URL}/api/system/operating-rooms/${operatingRoom.id}/surgery`);
            
            if (response.data.length > 0) {
                // 這個手術房有手術，標記為不可修改 roomType
                setEditingOperatingRoom({ ...operatingRoom, hasSurgeries: true });
            } else {
                // 沒有手術，可以正常編輯
                setEditingOperatingRoom({ ...operatingRoom, hasSurgeries: false });
            }
        } catch (error) {
            console.error("查詢手術房的手術失敗：", error);
        }
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
            console.error("更新失敗：", error);
        }
    };

    const handleCheckboxChange = (operatingRoom) => {
        setSelectedOperatingRooms((prevSelected) =>
            prevSelected.includes(operatingRoom)
                ? prevSelected.filter(selectedRoom => selectedRoom.id !== operatingRoom.id)
                : [...prevSelected, operatingRoom]
        );
    };

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
                        setEmptyError={setEmptyError}
                    />
                    {filteredOperatingRooms.length > 0 ? (
                        filteredOperatingRooms.map((operatingRoom) => (
                            editingOperatingRoom?.id === operatingRoom.id ? (
                                <EditableRow
                                    key={operatingRoom.id}
                                    operatingRoom={editingOperatingRoom}
                                    handleSave={handleSave}
                                    setIsEditing={setEditingOperatingRoom}
                                />
                            ) : (
                                // <tr key={operatingRoom.id}>
                                <tr
                                    key={operatingRoom.id}
                                    className={selectedOperatingRooms.includes(operatingRoom.id) ? "selected" : "unselected"}
                                >

                                    <td
                                        onClick={() => handleCheckboxChange(operatingRoom.id)}
                                        className={`selectable-cell ${selectedOperatingRooms.includes(operatingRoom.id) ? "selected" : ""}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedOperatingRooms.includes(operatingRoom.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => handleCheckboxChange(operatingRoom.id)}
                                            className="checkbox"
                                        />
                                    </td>
                                    <td>{operatingRoom.id}</td>
                                    <td>{operatingRoom.name}</td>
                                    <td>{operatingRoom.department.name}</td>
                                    <td>{operatingRoom.roomType}</td>
                                    {/* <td> {statusDisplayMap[operatingRoom.status]}</td> */}
                                    <td className="text-center p-0">
                                        <div className="flex justify-center items-center gap-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill={
                                                    operatingRoom.status
                                                        ? "#facc15" // 開啟：黃色
                                                        : "#9ca3af" // 關閉：灰色
                                                }
                                                className="w-5 h-5"
                                            >
                                                <path d="M12 .75a8.25 8.25 0 0 0-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 0 0 .577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 0 1-.937-.171.75.75 0 1 1 .374-1.453 5.261 5.261 0 0 0 2.626 0 .75.75 0 1 1 .374 1.452 6.712 6.712 0 0 1-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 0 0 .577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0 0 12 .75Z" />
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9.013 19.9a.75.75 0 0 1 .877-.597 11.319 11.319 0 0 0 4.22 0 .75.75 0 1 1 .28 1.473 12.819 12.819 0 0 1-4.78 0 .75.75 0 0 1-.597-.876ZM9.754 22.344a.75.75 0 0 1 .824-.668 13.682 13.682 0 0 0 2.844 0 .75.75 0 1 1 .156 1.492 15.156 15.156 0 0 1-3.156 0 .75.75 0 0 1-.668-.824Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span>{statusDisplayMap[operatingRoom.status]}</span>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleEdit(operatingRoom)} className="action-button edit-button">
                                                <FontAwesomeIcon icon={faPenSquare} className="action-icon" />
                                            </button>
                                            <button onClick={() => handleDelete(operatingRoom)} className="action-button delete-button">
                                                <FontAwesomeIcon icon={faTrash} className="action-icon" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="py-4 px-4 text-center text-gray-500 italic">
                                無符合條件的資料
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ORListWrapper;
