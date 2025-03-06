/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";

function ORAddWrapper({ operatingRooms, setOperatingRooms, emptyError }) {
    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const updatedOperatingRooms = [...operatingRooms];
        updatedOperatingRooms[index][name] = value;
        setOperatingRooms(updatedOperatingRooms);
    };
    const [departments, setDepartments] = useState([]);

    const addRow = () => {
        setOperatingRooms([
            ...operatingRooms,
            { id: "", name: "", departmentId: "1", roomType: "", status: 1 },
        ]);
    };

    const removeRow = () => {
        if (operatingRooms.length > 1) {
            setOperatingRooms(operatingRooms.slice(0, -1));
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(BASE_URL + "/api/system/departments");
                setDepartments(response.data);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log("正在新增的手術房：", operatingRooms);
    }, [operatingRooms]);

    return (
        <div className="mgr-list">
            <table className="system-table">
                <thead>
                    <tr>
                        <th>手術房編號</th>
                        <th>手術房名稱</th>
                        <th>所屬科別</th>
                        <th>手術房種類</th>
                        <th>手術房狀態</th>
                    </tr>
                </thead>

                <tbody>
                    {operatingRooms.map((operatingRoom, index) => (
                        <tr className="editable-row" key={index}>
                            <td>
                                <input
                                    type="text"
                                    name="id"
                                    value={operatingRoom.id}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="請輸入手術房編號"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="name"
                                    value={operatingRoom.name}
                                    onChange={(e) => handleChange(index, e)}
                                />
                            </td>
                            <td>
                                <select
                                    name="departmentId"
                                    value={operatingRoom.departmentId}
                                    onChange={(e) => handleChange(index, e)}
                                >
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="roomType"
                                    value={operatingRoom.roomType}
                                    onChange={(e) => handleChange(index, e)}
                                />
                            </td>
                            <td>
                                <select
                                    name="status"
                                    value={operatingRoom.status}
                                    onChange={(e) => handleChange(index, e)}
                                >
                                    <option value={1}>開啟</option>
                                    <option value={0}>關閉</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="error">{emptyError}</p>

            <div>
                <button className="row-button" onClick={addRow}>➕</button>
                <button className="row-button" onClick={removeRow}>➖</button>
            </div>
        </div>
    );
}

export default ORAddWrapper;
