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

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/api/system/chief-surgeon/delete/${id}`);
            const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
            setChiefSurgeons(response.data);
            const responseDpartments = await axios.get(BASE_URL + "/api/system/departments");
            setDepartments(responseDpartments.data);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    }

    return (
        <td colSpan={5}>
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
                            <EditableRow key={chiefSurgeon.id} chiefSurgeon={chiefSurgeon} handleSave={handleSave} />
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
                                        <FontAwesomeIcon className="edit-button" icon={faPenSquare}
                                            onClick={() => handleEdit(chiefSurgeon)} />
                                        <FontAwesomeIcon className="delete-button" icon={faTrash}
                                            onClick={() => handleDelete(chiefSurgeon.id)} />
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