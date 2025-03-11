/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";

function SurgerItems({ operatingRoomId }) {
    const [surgeries, setSurgeries] = useState([]);

    useEffect(() => {
        const fetchSurgeries = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/system/operating-rooms/${operatingRoomId}/surgery`);
                setSurgeries(response.data);
            } catch (error) {
                console.error("Error fetching surgeries:", error);
            }
        }

        fetchSurgeries();
    }, [operatingRoomId])

    /*useEffect(() => {
        console.log(surgeries);
    },[surgeries])*/

    return (
        <>
            {surgeries.map(surgery => (
                <div key={surgery.applicationId}>{surgery.applicationId}</div>
            ))}
        </>
    )
}

export default SurgerItems;