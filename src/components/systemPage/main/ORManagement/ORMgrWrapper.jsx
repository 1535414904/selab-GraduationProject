/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import ORHeaderWrapper from "./header/ORHeaderWrapper";
import ORListWrapper from "./main/ORListWrapper";
import axios from "axios";
import { BASE_URL } from "../../../../config";
import ORFilter from "./ORFilter";

function ORMgrWrapper({ reloadKey }) {
    const [operatingRooms, setOperatingRooms] = useState([]);
    const [filterOperatingRoom, setFilterOperatingRoom] = useState({ id: "", name: "", department: "", roomType: "", status: "" });
    const [selectedOperatingRooms, setSelectedOperatingRooms] = useState([]);
    const [addOperatingRooms, setAddOperatingRooms] = useState([]);
    const [emptyError, setEmptyError] = useState({});
    const [isOpen, setIsOpen] = useState(false);

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

    const handleAdd = async (operatingRoom) => {
        let errors = {};
        // 確保錯誤訊息的 key 是唯一的
        const idErrorKey = `${operatingRoom.uniqueId}-id`;
        const nameErrorKey = `${operatingRoom.uniqueId}-name`;
        // 檢查是否為空
        if (!operatingRoom.id.trim()) {
            errors[idErrorKey] = "*手術房編號欄位不得為空";
        } else if (operatingRooms.some(room => room.id === operatingRoom.id)) {
            errors[idErrorKey] = `手術房編號 "${operatingRoom.id}" 已存在，請使用其他編號`;
        }

        if (!operatingRoom.operatingRoomName.trim()) {
            errors[nameErrorKey] = "*手術房名稱欄位不得為空";
        } else if (operatingRooms.some(room => room.operatingRoomName === operatingRoom.operatingRoomName)) {
            errors[nameErrorKey] = `手術房名稱 "${operatingRoom.name}" 已存在，請使用其他名稱`;
        }

        if (Object.keys(errors).length > 0) {
            setEmptyError(prev => ({ ...prev, ...errors }));
            return;
        }

        setEmptyError(prev => {
            const newErrors = { ...prev };
            delete newErrors[idErrorKey];
            delete newErrors[nameErrorKey];
            return newErrors;
        });

        try {
            await axios.post(`${BASE_URL}/api/system/operating-room/add`, operatingRoom);
            console.log(operatingRoom);
            const response = await axios.get(`${BASE_URL}/api/system/operating-rooms`);
            setOperatingRooms(response.data);
            cleanAddRow(operatingRoom.uniqueId);
        } catch (error) {
            console.error("Error add data: ", error);
        }
    };

    const cleanAddRow = (uniqueId) => {
        setAddOperatingRooms(prev => prev.filter(room => room.uniqueId !== uniqueId));
        setEmptyError(prev => {
            const newErrors = { ...prev };
            delete newErrors[uniqueId];
            return newErrors;
        });
    };

    const handleDeleteAll = async (selected) => {
        if (selected.length === 0) {
            alert("請選擇要刪除的手術房");
            return;
        }

        const confirmed = window.confirm(`請確認是否刪除這 ${selected.length} 間手術房？`);
        if (!confirmed) {
            setSelectedOperatingRooms([]);
            return;
        }

        try {
            await axios.delete(`${BASE_URL}/api/system/operating-rooms/delete`, {
                data: selected
            });

            const response = await axios.get(`${BASE_URL}/api/system/operating-rooms`);
            setOperatingRooms(response.data);
            setSelectedOperatingRooms([]);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };

    const handleDelete = async (room) => {
        const confirmed = window.confirm(`請確認是否刪除手術房 ${room.name} (ID: ${room.id})？`);
        if (!confirmed) return;

        try {
            await axios.delete(`${BASE_URL}/api/system/operating-room/delete/${room.id}`);
            const response = await axios.get(`${BASE_URL}/api/system/operating-rooms`);
            setOperatingRooms(response.data);
            setSelectedOperatingRooms([]);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };
    // return (
    //     <div key={reloadKey} className="mgr-wrapper">
    //         <ORHeaderWrapper
    //             operatingRooms={operatingRooms}
    //             setOperatingRooms={setOperatingRooms}
    //             filterOperatingRoom={filterOperatingRoom}
    //             setFilterOperatingRoom={setFilterOperatingRoom}
    //             selectedOperatingRooms={selectedOperatingRooms}
    //             setSelectedOperatingRooms={setSelectedOperatingRooms}
    //             setEmptyError={setEmptyError}
    //             handleDelete={handleDeleteAll}
    //             addOperatingRooms={addOperatingRooms}
    //             setAddOperatingRooms={setAddOperatingRooms}
    //         />
    //         <ORListWrapper
    //             operatingRooms={operatingRooms}
    //             setOperatingRooms={setOperatingRooms}
    //             filterOperatingRoom={filterOperatingRoom}
    //             selectedOperatingRooms={selectedOperatingRooms}
    //             setSelectedOperatingRooms={setSelectedOperatingRooms}
    //             handleDelete={handleDelete}
    //             addOperatingRooms={addOperatingRooms}
    //             setAddOperatingRooms={setAddOperatingRooms}
    //             handleAdd={handleAdd}
    //             emptyError={emptyError}
    //             setEmptyError={setEmptyError}
    //         />
    //     </div>
    // )


    return (
        <div key={reloadKey} className="mgr-wrapper relative overflow-hidden">
            <ORHeaderWrapper
                operatingRooms={operatingRooms}
                // setOperatingRooms={setOperatingRooms}
                filterOperatingRoom={filterOperatingRoom}
                // setFilterOperatingRoom={setFilterOperatingRoom}
                selectedOperatingRooms={selectedOperatingRooms}
                setSelectedOperatingRooms={setSelectedOperatingRooms}
                setEmptyError={setEmptyError}
                handleDelete={handleDeleteAll}
                addOperatingRooms={addOperatingRooms}
                setAddOperatingRooms={setAddOperatingRooms}
            />

            <div className="flex w-full transition-all duration-500 ease-in-out">
                {/* 篩選器滑入區塊 */}
                {isOpen && (
                    <div className="w-75 shrink-0 transition-all duration-500 ease-in-out p-4">
                        <ORFilter
                            isOpen={isOpen}
                            operatingRooms={operatingRooms}
                            filterOperatingRoom={filterOperatingRoom}
                            setFilterOperatingRoom={setFilterOperatingRoom}
                            onClose={() => setIsOpen(false)}
                        />
                    </div>
                )}

                {/* 表格內容區塊 */}
                <div className="flex-1 transition-all duration-500 ease-in-out relative">
                    {!isOpen && (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="absolute top-4 left-4 z-20 bg-blue-500 text-white px-2 py-4 rounded shadow size-15"
                            style={{ width: "70px", fontSize: "20px" }}
                        >
                            篩選
                        </button>
                    )}

                    <div className="p-4">
                        <ORListWrapper
                            operatingRooms={operatingRooms}
                            setOperatingRooms={setOperatingRooms}
                            filterOperatingRoom={filterOperatingRoom}
                            selectedOperatingRooms={selectedOperatingRooms}
                            setSelectedOperatingRooms={setSelectedOperatingRooms}
                            handleDelete={handleDelete}
                            addOperatingRooms={addOperatingRooms}
                            setAddOperatingRooms={setAddOperatingRooms}
                            handleAdd={handleAdd}
                            emptyError={emptyError}
                            setEmptyError={setEmptyError}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ORMgrWrapper;
