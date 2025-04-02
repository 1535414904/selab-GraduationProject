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
    const [emptyError, setEmptyError] = useState({});

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
        } else {
            // 只有在不為空的情況下，才檢查是否重複
            const isDuplicateId = operatingRooms.some(existingRoom => existingRoom.id === operatingRoom.id);
            if (isDuplicateId) {
                errors[idErrorKey] = `手術房編號 "${operatingRoom.id}" 已存在，請使用其他編號`;
            } else {
                delete errors[idErrorKey]; // 清除錯誤訊息
            }
        }

        if (!operatingRoom.name.trim()) {
            errors[nameErrorKey] = "*手術房名稱欄位不得為空";
        } else {
            // 只有在不為空的情況下，才檢查是否重複
            const isDuplicateName = operatingRooms.some(existingRoom => existingRoom.name === operatingRoom.name);
            if (isDuplicateName) {
                errors[nameErrorKey] = `手術房名稱 "${operatingRoom.name}" 已存在，請使用其他名稱`;
            } else {
                delete errors[nameErrorKey]; // 清除錯誤訊息
            }
        }

        // 如果有錯誤，設定錯誤訊息並中止新增
        if (Object.keys(errors).length > 0) {
            setEmptyError(prevErrors => ({ ...prevErrors, ...errors }));
            return;
        }

        // 若無錯誤，清除該列的錯誤訊息
        setEmptyError(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[idErrorKey];
            delete newErrors[nameErrorKey];
            return newErrors;
        });

        try {
            await axios.post(`${BASE_URL}/api/system/operating-room/add`, operatingRoom);
            const response = await axios.get(`${BASE_URL}/api/system/operating-rooms`);
            setOperatingRooms(response.data);
            cleanAddRow(operatingRoom.uniqueId); // 刪除新增的手術房
        } catch (error) {
            console.error("Error add data: ", error);
        }
    };

    const cleanAddRow = (uniqueId) => {
        const updated = addOperatingRooms.filter(operatingRoom => operatingRoom.uniqueId !== uniqueId);
        setAddOperatingRooms(updated);
        setEmptyError((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[uniqueId];  // 根據 uniqueId 刪除錯誤
            return newErrors;
        });
    }

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

    const handleDelete = async (operatingRoom) => {
        const isConfirmed = window.confirm(`請確認是否刪除手術房 ${operatingRoom.name} ( ID: ${operatingRoom.id} )？`);
        if (!isConfirmed) return;

        try {
            await axios.delete(`${BASE_URL}/api/system/operating-room/delete/${operatingRoom.id}`);

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
                setEmptyError={setEmptyError}
            />

        </div>
    )
}

export default ORMgrWrapper;