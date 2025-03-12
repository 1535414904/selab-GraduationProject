/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";
import SurgeryDetail from "./SurgeryDetail";

function SurgeryItems({ operatingRoomId }) {
    const [surgeries, setSurgeries] = useState([]);
    const [selectedSurgery, setSelectedSurgery] = useState(null);

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

    /**/useEffect(() => {
        console.log(selectedSurgery);
    },[selectedSurgery])

    return (
        <div className="surgeries-list">
            {surgeries.map(surgery => (
                <div key={surgery.applicationId} className="surgery-item" onClick={() => setSelectedSurgery(surgery)}>
                    <div>{surgery.applicationId}</div>
                    <div>{surgery.patientName}</div>
                </div>
            ))}
            {selectedSurgery && <SurgeryDetail surgery={selectedSurgery} onClose={() => setSelectedSurgery(null)}/>}
        </div>
    )
}

export default SurgeryItems;