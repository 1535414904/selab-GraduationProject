/* eslint-disable react/prop-types */
import axios from "axios";
import { BASE_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import EditableRow from "./EditableRow";
import AddRow from "./AddRow";

function ChiefSurgeonListWrapper({ departmentId, addChiefSurgeons, setAddChiefSurgeons, setDepartments }) {
    const [chiefSurgeons, setChiefSurgeons] = useState([]);
    const [editingChiefSurgeon, setEditingChiefSurgeon] = useState(null);
    const [emptyError, setEmptyError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
                setChiefSurgeons(response.data);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchData();
    }, [departmentId]);

    const handleEdit = (chiefSurgeon) => {
        setEditingChiefSurgeon(chiefSurgeon);
    };

    const handleAdd = async (chiefSurgeon) => {
        if (!chiefSurgeon.id.trim()) {
            setEmptyError("*員工編號欄位不得為空");
        } else {
            try {
                await axios.post(`${BASE_URL}/api/system/${departmentId}/chief-surgeon/add`, chiefSurgeon);
                const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
                setChiefSurgeons(response.data);
                const responseDpartments = await axios.get(BASE_URL + "/api/system/departments");
                setDepartments(responseDpartments.data);
                setEmptyError(null);
            } catch (error) {
                console.error("Error add data: ", error);
            }
        }
    }

    const handleSave = async (updatedChiefSurgeon) => {
        try {
            await axios.put(`${BASE_URL}/api/system/chief-surgeon/${updatedChiefSurgeon.id}`, updatedChiefSurgeon);
            const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
            setChiefSurgeons(response.data);
            setEditingChiefSurgeon(null);
        } catch (error) {
            console.error("updated error：", error);
        }
    };

    // const handleDelete = async (id) => {
    //     try {
    //         await axios.delete(`${BASE_URL}/api/system/chief-surgeon/delete/${id}`);
    //         const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
    //         setChiefSurgeons(response.data);
    //         const responseDpartments = await axios.get(BASE_URL + "/api/system/departments");
    //         setDepartments(responseDpartments.data);
    //     } catch (error) {
    //         console.error("刪除失敗：", error);
    //     }
    // }
    const handleDelete = async (id, name) => {
        const isConfirmed = window.confirm(`請確認是否刪除該主治醫師 ${name} （ID: ${id}）？`);
        if (!isConfirmed) return;

        try {
            await axios.delete(`${BASE_URL}/api/system/chief-surgeon/delete/${id}`);

            // 重新獲取該科別的主治醫師資料
            const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
            setChiefSurgeons(response.data);

            // 重新獲取所有科別的資料
            const responseDepartments = await axios.get(`${BASE_URL}/api/system/departments`);
            setDepartments(responseDepartments.data);

        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };
    const handleAddChiefSurgeon = () => {
        setAddChiefSurgeons((prev) => [...prev, { id: "", name: "" }]);
    };
    const [selectedIds, setSelectedIds] = useState([]);

    const handleDeleteSelectedChiefSurgeons = async () => {
        if (selectedIds.length === 0) {
            alert("請先選取要刪除的主治醫師");
            return;
        }

        const confirmDelete = window.confirm(`確定要刪除 ${selectedIds.length} 位主治醫師？`);
        if (!confirmDelete) return;

        try {
            await Promise.all(
                selectedIds.map((id) =>
                    axios.delete(`${BASE_URL}/api/system/chief-surgeon/delete/${id}`)
                )
            );

            const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
            setChiefSurgeons(response.data);
            const responseDepartments = await axios.get(`${BASE_URL}/api/system/departments`);
            setDepartments(responseDepartments.data);
            setSelectedIds([]);
        } catch (error) {
            console.error("批次刪除失敗：", error);
        }
    };

    return (

        <td colSpan={5}>
            {/* 🔘 功能列 */}
            <div className="header-function mb-3 flex gap-2">
                <button className="account-button" onClick={handleAddChiefSurgeon} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        style={{ width: "1em", height: "1em" }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                    新增
                </button>
                <button
                    className="account-button mgr-cancel"
                    onClick={handleDeleteSelectedChiefSurgeons}
                    style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        style={{ width: "1em", height: "1em" }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                    刪除
                </button>
            </div>
            <table className="system-table chief-surgeon-list">
                <thead>
                    <tr>
                        <th>選取</th>
                        <th>員工編號</th>
                        <th>醫師姓名</th>
                        <th>動作</th>
                    </tr>
                </thead>
                <tbody>
                    <AddRow
                        addChiefSurgeons={addChiefSurgeons}
                        setAddChiefSurgeons={setAddChiefSurgeons}
                        handleAdd={handleAdd}
                        emptyError={emptyError}
                    />
                    {chiefSurgeons.map((chiefSurgeon) => (
                        editingChiefSurgeon?.id === chiefSurgeon.id ? (
                            <EditableRow
                                key={chiefSurgeon.id}
                                chiefSurgeon={chiefSurgeon}
                                handleSave={handleSave}
                            />
                        ) : (
                            <tr key={chiefSurgeon.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                    />
                                </td>
                                <td>{chiefSurgeon.id}</td>
                                <td>{chiefSurgeon.name}</td>
                                <td>
                                    <div className="action-buttons">
                                        {/* 編輯按鈕 */}
                                        <button onClick={() => handleEdit(chiefSurgeon)} className="action-button edit-button">
                                            <FontAwesomeIcon icon={faPenSquare} className="action-icon" />
                                        </button>

                                        {/* 刪除按鈕 */}
                                        <button onClick={() => handleDelete(chiefSurgeon.id, chiefSurgeon.name)} className="action-button delete-button">
                                            <FontAwesomeIcon icon={faTrash} className="action-icon" />
                                        </button>
                                    </div>

                                </td>
                            </tr>
                        )
                    ))}
                </tbody>
            </table>
        </td >
    )
}

export default ChiefSurgeonListWrapper;