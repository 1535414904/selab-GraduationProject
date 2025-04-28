import axios from "axios";
import { useEffect, useState } from "react";
import SurgeryItems from "./SurgeryItems";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AddSurgery from "./AddSurgery";
import { BASE_URL } from "../../../../../config";
import "../../Mgr.css";

/* eslint-disable react/prop-types */
function SurgerListWrapper({ user, operatingRooms, filterOperatingRoom, setReloadKey, nowUsername }) {
  const [lastSurgeryTimes, setLastSurgeryTimes] = useState([]);
  const [addingSurgery, setAddingSurgery] = useState(null);
  const [filteredOperatingRooms, setFilteredOperatingRooms] = useState([]);

  // 根據篩選條件過濾 operatingRooms
  useEffect(() => {
    const filtered = operatingRooms.filter(or => {
      const matchId = filterOperatingRoom.id
        ? or.id.toLowerCase().includes(filterOperatingRoom.id.toLowerCase())
        : true;
      const matchName = filterOperatingRoom.operatingRoomName
        ? or.operatingRoomName.toLowerCase().includes(filterOperatingRoom.operatingRoomName.toLowerCase())
        : true;
      const matchDepartment = filterOperatingRoom.department
        ? or.department.name === filterOperatingRoom.department
        : true;
      const matchRoomType = filterOperatingRoom.roomType
        ? or.roomType === filterOperatingRoom.roomType
        : true;
      return matchId && matchName && matchDepartment && matchRoomType;
    });
    setFilteredOperatingRooms(filtered);
  }, [operatingRooms, filterOperatingRoom]);

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
      <table className="system-table table-surgeries">
        <thead>
          <tr>
            <th>編號</th>
            <th>手術房名稱</th>
            <th>種類</th>
            <th>科別</th>
            <th>可用時間點</th>
            <th>手術房預約狀況</th>
            <th>動作</th>
          </tr>
        </thead>
        <tbody>
          {filteredOperatingRooms.map((operatingRoom) => {
            const lastSurgery = lastSurgeryTimes.find(s => s.operatingRoomId === operatingRoom.id);
            return (
              <tr key={operatingRoom.id}>
                <td>{operatingRoom.id}</td>
                <td>{operatingRoom.operatingRoomName}</td>
                <td>{operatingRoom.roomType}</td>
                <td>{operatingRoom.department.name}</td>
                <td>{lastSurgery ? lastSurgery.lastSurgeryEndTime : "載入中..."}</td>
                <td>
                  <SurgeryItems user={user} operatingRoom={operatingRoom} operatingRooms={operatingRooms} setReloadKey={setReloadKey} />
                </td>
                <td>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <button className="action-button add-button" onClick={() => setAddingSurgery(operatingRoom.id)}>
                      <FontAwesomeIcon icon={faPlus} className="action-icon" />
                    </button>
                  </div>

                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {addingSurgery && (
        <AddSurgery
          onClose={() => setAddingSurgery(null)}
          operatingRooms={operatingRooms}
          nowUsername={nowUsername}
          addingSurgery={addingSurgery}
          setReloadKey={setReloadKey}
        />
      )}
    </div>
  );
}

export default SurgerListWrapper;
