import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";
import SurgeryItems from "./SurgeryItems";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AddSurgery from "./AddSurgery";

/* eslint-disable react/prop-types */
function SurgerListWrapper({ operatingRooms, setReloadKey, nowUsername }) {
    const [lastSurgeryTimes, setLastSurgeryTimes] = useState([]);
    const [addingSurgery, setAddingSurgery] = useState(null);

    useEffect(() => {
        const fetchAllLastSurgeryTimes = async () => {
            if (operatingRooms.length === 0) return;

            try {
                const responses = await Promise.all(
                    operatingRooms.map(operatingRoom =>
                        axios.get(`${BASE_URL}/api/system/operating-rooms/${operatingRoom.id}/last-surgery-time`)
                    )
                );

                setLastSurgeryTimes(responses.map(res => res.data));
            } catch (error) {
                console.error("Error fetching last surgery times:", error);
            }
        };

        fetchAllLastSurgeryTimes();
    }, [operatingRooms]);

    return (
        <div className="mgr-list">
            <table className="system-table">
                <thead>
                    <tr>
                        <th>手術房編號</th>
                        <th>手術房名稱</th>
                        <th>手術房種類</th>
                        <th>所屬科別</th>
                        <th>預期可用時間點</th>
                        <th>預約狀況</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {operatingRooms.map((operatingRoom) => {
                        const lastSurgery = lastSurgeryTimes.find(s => s.operatingRoomId === operatingRoom.id);
                        return (
                            <tr key={operatingRoom.id}>
                                <td>{operatingRoom.id}</td>
                                <td>{operatingRoom.name}</td>
                                <td>{operatingRoom.roomType}</td>
                                <td>{operatingRoom.department.name}</td>
                                <td>{lastSurgery ? lastSurgery.lastSurgeryEndTime : "載入中..."}</td>
                                <td>
                                    <SurgeryItems operatingRoom={operatingRoom} operatingRooms={operatingRooms} setReloadKey={setReloadKey} />
                                </td>
                                <td>
                                    <button className="action-button add-button" onClick={() => setAddingSurgery(operatingRoom.id)}>
                                        <FontAwesomeIcon icon={faPlus} className="action-icon" />
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {addingSurgery &&
                <AddSurgery
                    onClose={() => setAddingSurgery(null)}
                    operatingRooms={operatingRooms}
                    nowUsername={nowUsername}
                    addingSurgery={addingSurgery}
                    setReloadKey={setReloadKey}
                />}

        </div>
    )
}

export default SurgerListWrapper;