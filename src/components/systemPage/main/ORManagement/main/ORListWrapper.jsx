/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
import { faPenSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import EditableRow from "./EditableRow";
import axios from "axios";
import { BASE_URL } from "../../../../../config";

function ORListWrapper({
    operatingRooms, setOperatingRooms,
    filterOperatingRoom, deleteMode,
    selectedOperatingRooms, setSelectedOperatingRooms }) {

    const [filteredOperatingRooms, setFilteredOperatingRooms] = useState([]);
    const [editingOperatingRoom, setEditingOperatingRoom] = useState(null);
    const tbodyRef = useRef(null);
    const theadRef = useRef(null);

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

    useEffect(() => {
        const adjustTheadWidth = () => {
            if (tbodyRef.current.scrollHeight > window.innerHeight * 0.6) {
                theadRef.current.style.width = "calc(100% - 17px)";
            } else {
                theadRef.current.style.width = "100%";
            }
        };

        if (tbodyRef.current) {
            adjustTheadWidth();
            tbodyRef.current.addEventListener("scroll", adjustTheadWidth);
        }

        return () => {
            if (tbodyRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                tbodyRef.current.removeEventListener("scroll", adjustTheadWidth);
            }
        };
    }, [filteredOperatingRooms]);

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

    const handleEdit = (operatingRoom) => {
        setEditingOperatingRoom(operatingRoom);
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
                <thead ref={theadRef}>
                    <tr>
                        <th>手術房編號</th>
                        <th>手術房名稱</th>
                        <th>所屬科別</th>
                        <th>手術房種類</th>
                        <th>手術房狀態</th>
                        <th>動作</th>
                    </tr>
                </thead>
                <tbody ref={tbodyRef}>
                    {filteredOperatingRooms.length > 0 ? (
                        filteredOperatingRooms.map((operatingRoom) => (
                            editingOperatingRoom?.id === operatingRoom.id ? (
                                <EditableRow
                                    key={operatingRoom.id}
                                    operatingRoom={operatingRoom}
                                    handleSave={handleSave}
                                />
                            ) : (
                                <tr key={operatingRoom.id}>
                                    <td>{operatingRoom.id}</td>
                                    <td>{operatingRoom.name}</td>
                                    <td>{operatingRoom.department.name}</td>
                                    <td>{operatingRoom.roomType}</td>
                                    {statusDisplayMap[operatingRoom.status]}
                                    <td>
                                        {deleteMode ? (
                                            <input
                                                type="checkbox"
                                                checked={selectedOperatingRooms.includes(operatingRoom.id)}
                                                onChange={() => handleCheckboxChange(operatingRoom.id)}
                                            />
                                        ) : (
                                            <FontAwesomeIcon className="edit-button" icon={faPenSquare} onClick={() => handleEdit(operatingRoom)} />
                                        )}
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