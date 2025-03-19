import { useEffect, useState } from "react";
import SurgeryHeaderWrapper from "./header/SurgeryHeaderWrapper";
import SurgerListWrapper from "./main/SurgerListWrapper";
import axios from "axios";
import { BASE_URL } from "../../../../config";

function SurgeryMgrWrapper({ reloadKey, setReloadKey, nowUsername }) {
  const [operatingRooms, setOperatingRooms] = useState([]);
  // 新增篩選狀態，請依需求預設所有欄位（此處包含：id, name, department, roomType）
  const [filterOperatingRoom, setFilterOperatingRoom] = useState({
    id: "",
    name: "",
    department: "",
    roomType: ""
  });
  const [addOperatingRooms, setAddOperatingRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(BASE_URL + "/api/system/operating-rooms");
        setOperatingRooms(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  // 您可自行定義 handleDelete
  const handleDelete = () => {
    // 範例：實作批次刪除
  };

  return (
    <div key={reloadKey} className="mgr-wrapper">
      <SurgeryHeaderWrapper 
        operatingRooms={operatingRooms}
        filterOperatingRoom={filterOperatingRoom}
        setFilterOperatingRoom={setFilterOperatingRoom}
        addOperatingRooms={addOperatingRooms}
        setAddOperatingRooms={setAddOperatingRooms}
        handleDelete={handleDelete}
      />
      <SurgerListWrapper 
        operatingRooms={operatingRooms}
        filterOperatingRoom={filterOperatingRoom}
        setReloadKey={setReloadKey}
        nowUsername={nowUsername}
      />
    </div>
  );
}

export default SurgeryMgrWrapper;
