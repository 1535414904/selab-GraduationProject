/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "../Mgr.css"
import { BASE_URL } from "../../../../config";
import DepartmentHeaderWrapper from "./header/DepartmentHeaderWrapper";
import DepartmentListWrapper from "./main/DepartmentListWrapper";
import axios from "axios";
import DepartmentAddWrapper from "./main/DepartmentAddWrapper";
import ChiefSurgeonMgrWrapper from "./chiefSurgeonManagement/ChiefSurgeonMgrWrapper";

function DepartmentMgrWrapper({ reloadKey }) {
    const [departments, setDepartments] = useState([]);
    const [pageState, setPageState] = useState("list");
    const [filterDepartment, setFilterDepartment] = useState({ id: "", name: "" });
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [addDepartments, setAddDepartments] = useState([
        { id: "", name: "" }
    ]);
    const [emptyError, setEmptyError] = useState(null);
    const [idforChiefSurgeons, setIdforChiefSurgeons] = useState("");

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

    const addHandleSubmit = async () => {
        const hasEmptyField = addDepartments.some(department => !department.id.trim());
        if (hasEmptyField) {
            setEmptyError("*科別編號欄位不得為空");
        } else {
            try {
                await axios.post(BASE_URL + "/api/system/departments/add", addDepartments);
                const response = await axios.get(BASE_URL + "/api/system/departments");
                setDepartments(response.data);
                setEmptyError(null);
                setPageState("list");
            } catch (error) {
                console.log("Error add data: ", error);
            }
        }

    }

    return (
        idforChiefSurgeons === "" ? (
            <div key={reloadKey} className="mgr-wrapper">
                <DepartmentHeaderWrapper
                    departments={departments}
                    setDepartments={setDepartments}
                    pageState={pageState}
                    toggleState={setPageState}
                    filterDepartment={filterDepartment}
                    setFilterDepartment={setFilterDepartment}
                    deleteMode={deleteMode}
                    setDeleteMode={setDeleteMode}
                    selectedDepartments={selectedDepartments}
                    setSelectedDepartments={setSelectedDepartments}
                    addHandleSubmit={addHandleSubmit}
                    setEmptyError={setEmptyError}
                />
                {pageState === "list" && (
                    <DepartmentListWrapper
                        departments={departments}
                        setDepartments={setDepartments}
                        filterDepartment={filterDepartment}
                        deleteMode={deleteMode}
                        selectedDepartments={selectedDepartments}
                        setSelectedDepartments={setSelectedDepartments}
                        setIdforChiefSurgeons={setIdforChiefSurgeons}
                    />
                )}
                {pageState === "add" && (
                    <DepartmentAddWrapper
                        departments={addDepartments}
                        setDepartments={setAddDepartments}
                        emptyError={emptyError}
                    />
                )}
            </div>
        ) : (<ChiefSurgeonMgrWrapper
            departmentId={idforChiefSurgeons}
            setIdforChiefSurgeons={setIdforChiefSurgeons}
        />)
    )
}

export default DepartmentMgrWrapper;