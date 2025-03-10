/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import ChiefSurgeonHeaderWrapper from "./header/ChiefSurgeonHeaderWrapper";
import { BASE_URL } from "../../../../../config";
import axios from "axios";
import ChiefSurgeonListWrapper from "./main/ChiefSurgeonListWrapper";
import ChiefSurgeonAddWrapper from "./main/ChiefSurgeonAddWrapper";

function ChiefSurgeonMgrWrapper({ departmentId, setIdforChiefSurgeons }) {
    const [chiefSurgeons, setChiefSurgeons] = useState([]);
    const [pageState, setPageState] = useState("list");
    const [filterChiefSurgeon, setFilterChiefSurgeon] = useState("");
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectChiefSurgeons, setSelectChiefSurgeons] = useState([]);
    const [addChiefSurgeons, setAddChiefSurgeons] = useState([
        { id: "", name: "", departmentId }
    ]);
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

    const addHandleSubmit = async () => {
        const hasEmptyField = addChiefSurgeons.some(surgeon => !surgeon.id.trim());
        if (hasEmptyField) {
            setEmptyError("*員工編號欄位不得為空");
        } else {
            try {
                const formattedChiefSurgeons = addChiefSurgeons.map(surgeon => ({
                    ...surgeon,
                    departmentId
                }));

                await axios.post(`${BASE_URL}/api/system/${departmentId}/chief-surgeons/add`, formattedChiefSurgeons);
                const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
                setChiefSurgeons(response.data);
                setEmptyError(null);
                setPageState("list");
            } catch (error) {
                console.log("Error add data: ", error);
            }
        }

    }

    return (
        <div className="mgr-wrapper">
            <ChiefSurgeonHeaderWrapper
                chiefSurgeon={chiefSurgeons}
                setChiefSurgeon={setChiefSurgeons}
                pageState={pageState}
                toggleState={setPageState}
                filterChiefSurgeon={filterChiefSurgeon}
                setFilterChiefSurgeon={setFilterChiefSurgeon}
                deleteMode={deleteMode}
                setDeleteMode={setDeleteMode}
                selectChiefSurgeons={selectChiefSurgeons}
                setSelectChiefSurgeons={setSelectChiefSurgeons}
                addHandleSubmit={addHandleSubmit}
                departmentId={departmentId}
                setDepartmentId={setIdforChiefSurgeons}
                setEmptyError={setEmptyError}
            />
            {pageState === "list" && (
                <ChiefSurgeonListWrapper
                    chiefSurgeons={chiefSurgeons}
                    setChiefSurgeons={setChiefSurgeons}
                    filterChiefSurgeon={filterChiefSurgeon}
                    deleteMode={deleteMode}
                    selectChiefSurgeons={selectChiefSurgeons}
                    setSelectChiefSurgeons={setSelectChiefSurgeons}
                    departmentId={departmentId}
                />
            )}
            {pageState === "add" && (
                <ChiefSurgeonAddWrapper
                    chiefSurgeons={addChiefSurgeons}
                    setChiefSurgeons={setAddChiefSurgeons}
                    emptyError={emptyError}
                />
            )}
        </div>
    )
}

export default ChiefSurgeonMgrWrapper;