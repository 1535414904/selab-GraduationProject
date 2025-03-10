/* eslint-disable react/prop-types */
import axios from "axios";
import { BASE_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

function ChiefSurgeonListWrapper({ departmentId }) {
    const [chiefSurgeons, setChiefSurgeons] = useState([]);

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

    return (
        <td colSpan={5} >
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
                                    <FontAwesomeIcon className="edit-button" icon={faPenSquare} />
                                    <FontAwesomeIcon className="delete-button" icon={faTrash} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </td>
    )
}

export default ChiefSurgeonListWrapper;