/* eslint-disable react/prop-types */
import axios from "axios";
import { BASE_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import EditableRow from "./EditableRow";

function ChiefSurgeonListWrapper({ departmentId }) {
    const [chiefSurgeons, setChiefSurgeons] = useState([]);
    const [editingChiefSurgeon, setEditingChiefSurgeon] = useState(null);

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

    return (
        <td colSpan={5} className="aaa">
            <table className="system-table chief-surgeon-list">
                <thead>
                    <tr>
                        <th></th>
                        <th>員工編號</th>
                        <th>醫師姓名</th>
                        <th>動作</th>
                    </tr>
                </thead>
                <tbody>
                    {chiefSurgeons.map((chiefSurgeon) => (
                        editingChiefSurgeon?.id === chiefSurgeon.id ? (
                            <EditableRow key={chiefSurgeon.id} chiefSurgeon={chiefSurgeon}/>
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
                                        <FontAwesomeIcon className="delete-button" icon={faTrash} />
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