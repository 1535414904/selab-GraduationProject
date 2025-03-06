/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import ORHeaderWrapper from "./header/ORHeaderWrapper";
import ORListWrapper from "./main/ORListWrapper";
import axios from "axios";
import { BASE_URL } from "../../../../config";
import ORAddWrapper from "./main/ORAddWrapper";

function ORMgrWrapper({ reloadKey }) {
    const [operatingRooms, setOperatingRooms] = useState([]);
    const [pageState, setPageState] = useState("list");
    const [filterOperatingRoom, setFilterOperatingRoom] = useState({
        is: "", name: ""
    });
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedOperatingRooms, setSelectedOperatingRooms] = useState([]);
    const [addOperatingRooms, setAddOperatingRooms] = useState([
        { id: "", name: "", departmentId: "1", roomType: "", status: 1 }
    ]);
    const [emptyError, setEmptyError] = useState("");

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

    const addHandleSubmit = async () => {
        const hasEmptyField = addOperatingRooms.some(operatingRoom => !operatingRoom.id.trim());
        if (hasEmptyField) {
            setEmptyError("*手術房編號欄位不得為空");
        } else {
            try {
                await axios.post(`${BASE_URL}/api/system/operating-rooms/add`, addOperatingRooms);
                const response = await axios.get(`${BASE_URL}/api/system/operating-rooms`);
                setOperatingRooms(response.data);
                setEmptyError(null);
                setPageState("list");
            } catch (error) {
                console.log("Error add data: ", error);
            }
        }
    }

    useEffect(() => {
        console.log("現選擇之欲刪除手術房：", selectedOperatingRooms);
    }, [selectedOperatingRooms])

    return (
        <div key={reloadKey} className="mgr-wrapper">
            <ORHeaderWrapper
                operatingRooms={operatingRooms}
                setOperatingRooms={setOperatingRooms}
                pageState={pageState}
                toggleState={setPageState}
                filterOperatingRoom={filterOperatingRoom}
                setFilterOperatingRoom={setFilterOperatingRoom}
                deleteMode={deleteMode}
                setDeleteMode={setDeleteMode}
                selectedOperatingRooms={selectedOperatingRooms}
                setSelectedOperatingRooms={setSelectedOperatingRooms}
                addHandleSubmit={addHandleSubmit}
                setEmptyError={setEmptyError}
            />
            {pageState === "list" && (
                <ORListWrapper
                    operatingRooms={operatingRooms}
                    setOperatingRooms={setOperatingRooms}
                    filterOperatingRoom={filterOperatingRoom}
                    deleteMode={deleteMode}
                    selectedOperatingRooms={selectedOperatingRooms}
                    setSelectedOperatingRooms={setSelectedOperatingRooms}
                />
            )}
            {pageState === "add" && (
                <ORAddWrapper
                    operatingRooms={addOperatingRooms}
                    setOperatingRooms={setAddOperatingRooms}
                    emptyError={emptyError}
                />
            )}
        </div>
    )
}

export default ORMgrWrapper;