import { useEffect, useRef, useState } from "react";
import EditableRow from "./EditableRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { BASE_URL } from "../../../../../../config";

/* eslint-disable react/prop-types */
function ChiefSurgeonListWrapper({ chiefSurgeons, setChiefSurgeons,
    filterChiefSurgeon, deleteMode,
    selectChiefSurgeons, setSelectChiefSurgeons,
    departmentId }) {

    const [filteredChiefSurgeons, setFilterChiefSurgeons] = useState([]);
    const [editingChiefSurgeon, setEditingChiefSurgeon] = useState(null);
    const tbodyRef = useRef(null);
    const theadRef = useRef(null);

    useEffect(() => {
        if (!chiefSurgeons.length) return;

        const newFilteredChiefSurgeons = chiefSurgeons.filter(chiefSurgeon => {
            const matchesId = filterChiefSurgeon.id ? chiefSurgeon.id.toLowerCase().includes(filterChiefSurgeon.id.toLowerCase()) : true;
            const matchesName = filterChiefSurgeon.name ? chiefSurgeon.name.toLowerCase().includes(filterChiefSurgeon.name.toLowerCase()) : true;

            return matchesId && matchesName;
        });

        const sortedChiefSurgeons = newFilteredChiefSurgeons.sort((a, b) => b.role - a.role);

        setFilterChiefSurgeons(sortedChiefSurgeons);
    }, [chiefSurgeons, filterChiefSurgeon.id, filterChiefSurgeon.name])

    useEffect(() => {
        const adjustTheadWidth = () => {
            if (tbodyRef.current.scrollHeight > window.innerHeight * 0.6) {
                theadRef.current.style.width = "calc(100% - 17px)";
            } else {
                theadRef.current.style.width = "100%";
            }
        };

        if (tbodyRef.current) {
            adjustTheadWidth();
            tbodyRef.current.addEventListener("scroll", adjustTheadWidth);
        }

        return () => {
            if (tbodyRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                tbodyRef.current.removeEventListener("scroll", adjustTheadWidth);
            }
        };
    }, [filteredChiefSurgeons]);

    const handleEdit = (chiefSurgeon) => {
        setEditingChiefSurgeon(chiefSurgeon);
    };

    const handleSave = async (updatedChiefSurgeon) => {
        console.log(updatedChiefSurgeon);
        try {
            await axios.put(`${BASE_URL}/api/system/chief-surgeon/${updatedChiefSurgeon.id}`, updatedChiefSurgeon);
            const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
            setChiefSurgeons(response.data);
            setEditingChiefSurgeon(null);
        } catch (error) {
            console.error("updated error：", error);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectChiefSurgeons((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter(chiefSurgeon => chiefSurgeon != id)
                : [...prevSelected, id]
        );
    };

    useEffect(() => {
        console.log("選中的醫生 ID:", selectChiefSurgeons);
    }, [selectChiefSurgeons])

    return (
        <div className="mgr-list">
            <table className="system-table">
                <thead ref={theadRef}>
                    <tr>
                        <th>員工編號</th>
                        <th>醫師姓名</th>
                        <th>動作</th>
                    </tr>
                </thead>
                <tbody ref={tbodyRef}>
                    {filteredChiefSurgeons.length > 0 ? (
                        filteredChiefSurgeons.map(chiefSurgeon => (
                                editingChiefSurgeon?.id === chiefSurgeon.id ? (
                                    <EditableRow key={chiefSurgeon.id} chiefSurgeon={chiefSurgeon} handleSave={handleSave} />
                                ) : (
                                    <tr key={chiefSurgeon.id}>
                                        <td>{chiefSurgeon.id}</td>
                                        <td>{chiefSurgeon.name}</td>
                                        <td>
                                            {deleteMode ? (
                                                <input
                                                    type="checkbox"
                                                    checked={selectChiefSurgeons.includes(chiefSurgeon.id)}
                                                    onChange={() => handleCheckboxChange(chiefSurgeon.id)}
                                                />
                                            ) : (
                                                <FontAwesomeIcon className="edit-button" icon={faPenSquare} size="lg" onClick={() => handleEdit(chiefSurgeon)} />
                                            )}
                                        </td>
                                    </tr>
                                )
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">無符合條件的資料</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default ChiefSurgeonListWrapper;