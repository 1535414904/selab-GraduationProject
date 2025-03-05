import { useEffect, useState } from "react";
import ORHeaderWrapper from "./header/ORHeaderWrapper";
import ORListWrapper from "./main/ORListWrapper";
import axios from "axios";
import { BASE_URL } from "../../../../config";

function ORMgrWrapper({ reloadKey }) {
    const [operatingRooms, setOperatingRooms] = useState([]);
    const [pageState, setPageState] = useState("list");
    const [filterOperatingRoom, setFilterOperatingRoom] = useState({
        is:"", name:""
    });
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedOperatingRooms, setSelectedOperatingRooms] = useState([]);
    const [addOperatingRooms, setAddOperatingRooms] = useState([
        { id: "", name: "" }
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
                /*addHandleSubmit={addHandleSubmit}*/
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
        </div>
    )
}

export default ORMgrWrapper;