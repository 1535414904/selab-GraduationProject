/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import ORHeaderWrapper from "./header/ORHeaderWrapper";
import ORListWrapper from "./main/ORListWrapper";
import axios from "axios";
import { BASE_URL } from "../../../../config";

function ORMgrWrapper({ reloadKey }) {
    const [operatingRooms, setOperatingRooms] = useState([]);
    const [filterOperatingRoom, setFilterOperatingRoom] = useState({ id: "", name: "" });
    const [selectedOperatingRooms, setSelectedOperatingRooms] = useState([]);
    const [addOperatingRooms, setAddOperatingRooms] = useState([]);
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

    /*const addHandleSubmit = async () => {
        const hasEmptyField = addOperatingRooms.some(operatingRoom => !operatingRoom.id.trim());
        if (hasEmptyField) {
            setEmptyError("*手術房編號欄位不得為空");
        } else {
            try {
                await axios.post(`${BASE_URL}/api/system/operating-rooms/add`, addOperatingRooms);
                const response = await axios.get(`${BASE_URL}/api/system/operating-rooms`);
                setOperatingRooms(response.data);
                setEmptyError(null);
            } catch (error) {
                console.log("Error add data: ", error);
            }
        }
    }*/

    const handleAdd = async (operatingRoom) => {
        if (!operatingRoom.id.trim()) {
            setEmptyError("*手術房編號欄位不得為空");
        } else {
            try {
                await axios.post(`${BASE_URL}/api/system/operating-room/add`, operatingRoom);
                const response = await axios.get(BASE_URL + "/api/system/operating-rooms");
                setOperatingRooms(response.data);
                setEmptyError(null);
            } catch (error) {
                console.error("Error add data: ", error);
            }
        }
    }

    // const handleDeleteAll = async (selectedOperatingRooms) => {
    //     if (selectedOperatingRooms.length === 0) {
    //         alert("請選擇要刪除的手術房");
    //         return;
    //     }
    //     try {
    //         await axios.delete(`${BASE_URL}/api/system/operating-rooms/delete`, {
    //             data: selectedOperatingRooms
    //         });
    //         const response = await axios.get(BASE_URL + "/api/system/operating-rooms");
    //         setOperatingRooms(response.data);
    //         setSelectedOperatingRooms([]);
    //     } catch (error) {
    //         console.error("Delete fail：", error);
    //     }
    // }

    // const handleDelete = async (id) => {
    //     try {
    //         await axios.delete(`${BASE_URL}/api/system/operating-room/delete/${id}`);
    //         const response = await axios.get(BASE_URL + "/api/system/operating-rooms");
    //         setOperatingRooms(response.data);
    //         setSelectedOperatingRooms([]);
    //     } catch (error) {
    //         console.error("Delete fail：", error);
    //     }
    // }
    const handleDeleteAll = async (selectedOperatingRooms) => {
        if (selectedOperatingRooms.length === 0) {
            alert("請選擇要刪除的手術房");
            return;
        }

        const isConfirmed = window.confirm(`請確認是否刪除這 ${selectedOperatingRooms.length} 間手術房？`);
        if (!isConfirmed) {
            setSelectedOperatingRooms([]); // 取消勾選
            return;
        }

        try {
            await axios.delete(`${BASE_URL}/api/system/operating-rooms/delete`, {
                data: selectedOperatingRooms
            });

            // 重新獲取最新的手術房資料
            const response = await axios.get(`${BASE_URL}/api/system/operating-rooms`);
            setOperatingRooms(response.data);
            setSelectedOperatingRooms([]);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };

    const handleDelete = async (name, id) => {
        const isConfirmed = window.confirm(`請確認是否刪除手術房 ${name} ( ID: ${id} )？`);
        if (!isConfirmed) return;

        try {
            await axios.delete(`${BASE_URL}/api/system/operating-room/delete/${id}`);

            // 重新獲取最新的手術房資料
            const response = await axios.get(`${BASE_URL}/api/system/operating-rooms`);
            setOperatingRooms(response.data);
            setSelectedOperatingRooms([]);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };

    /*useEffect(() => {
        console.log("現選擇之欲刪除手術房：", selectedOperatingRooms);
    }, [selectedOperatingRooms])*/

    return (
        <div key={reloadKey} className="mgr-wrapper">
            <ORHeaderWrapper
                operatingRooms={operatingRooms}
                setOperatingRooms={setOperatingRooms}
                filterOperatingRoom={filterOperatingRoom}
                setFilterOperatingRoom={setFilterOperatingRoom}
                selectedOperatingRooms={selectedOperatingRooms}
                setSelectedOperatingRooms={setSelectedOperatingRooms}
                setEmptyError={setEmptyError}
                handleDelete={handleDeleteAll}
                addOperatingRooms={addOperatingRooms}
                setAddOperatingRooms={setAddOperatingRooms}
            />
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
            />

        </div>
    )
}

export default ORMgrWrapper;