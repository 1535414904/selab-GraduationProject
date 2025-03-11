/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import SurgeryHeaderWrapper from "./header/surgeryHeaderWrapper";
import SurgerListWrapper from "./main/SurgerListWrapper";
import axios from "axios";
import { BASE_URL } from "../../../../config";

function SurgeryMgrWrapper({ reloadKey }){
    const [operatingRooms, setOperatingRooms] = useState([]);

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
            <SurgeryHeaderWrapper />
            <SurgerListWrapper 
                operatingRooms={operatingRooms}
            />
        </div>
    )
}

export default SurgeryMgrWrapper;