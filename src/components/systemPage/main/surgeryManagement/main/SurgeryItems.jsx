/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";
import SurgeryDetail from "./SurgeryDetail";

function SurgeryItems({ operatingRoom, operatingRooms, setReloadKey }) {
    const [surgeries, setSurgeries] = useState([]);
    const [selectedSurgery, setSelectedSurgery] = useState(null);

    const fetchSurgeries = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/system/operating-rooms/${operatingRoom.id}/surgery`);
            let surgeryList = response.data;

            // ✅ 加入依 orderInRoom 排序
            surgeryList.sort((a, b) => a.orderInRoom - b.orderInRoom);

            let startTime = 510;
            surgeryList = surgeryList.map(surgery => {
                const endTime = startTime + surgery.estimatedSurgeryTime;
                const formattedStart = formatTime(startTime);
                const formattedEnd = formatTime(endTime);

                const updatedSurgery = {
                    ...surgery,
                    startTime: formattedStart,
                    endTime: formattedEnd
                };

                startTime = endTime + 45;

                return updatedSurgery;
            });

            setSurgeries(surgeryList);
        } catch (error) {
            console.error("Error fetching surgeries:", error);
        }
    };

    useEffect(() => {
        fetchSurgeries();
    }, []);

    const handleSave = async (updateSurgery) => {
        const isConfirmed = window.confirm(`確定要儲存對申請編號 ${updateSurgery.applicationId} 的變更嗎？`);
        if (!isConfirmed) return;

        try {
            await axios.put(
                `${BASE_URL}/api/system/surgery/${updateSurgery.applicationId}`,
                updateSurgery
            );

            setReloadKey((prevKey) => prevKey + 1);

            setSelectedSurgery((prev) =>
                prev && prev.applicationId === updateSurgery.applicationId
                    ? { ...prev, ...updateSurgery }
                    : prev
            );

        } catch (error) {
            console.error("updated error:", error);
        }
    };

    const handleDelete = async (name, id) => {
        const isConfirmed = window.confirm(`請確認是否刪除手術 ${name} ( ID: ${id} )？`);
        if (!isConfirmed) return;

        try {
            await axios.delete(`${BASE_URL}/api/system/surgery/delete/${id}`)
        } catch (error) {
            console.error("刪除失敗：", error);
        }

        window.location.reload();
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60) % 24;
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    useEffect(() => {
        console.log("選中的手術：", selectedSurgery);
    }, [selectedSurgery]);

    return (
        <div className="surgeries-list">
            {surgeries.map(surgery => (
                <div key={surgery.applicationId} className="surgery-item" onClick={() => setSelectedSurgery(surgery)}>
                    <div>{surgery.medicalRecordNumber || "未指定"}</div>
                    <div>{surgery.patientName || "未指定"}</div>
                </div>
            ))}
            {selectedSurgery && (
                <SurgeryDetail
                    onClose={() => setSelectedSurgery(null)}
                    surgery={selectedSurgery}
                    operatingRooms={operatingRooms}
                    handleSave={handleSave}
                    handleDelete={handleDelete}
                />
            )}
        </div>
    );
}

export default SurgeryItems;
