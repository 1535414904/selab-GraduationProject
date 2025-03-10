/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "../Mgr.css"
import { BASE_URL } from "../../../../config";
import DepartmentHeaderWrapper from "./header/DepartmentHeaderWrapper";
import DepartmentListWrapper from "./main/DepartmentListWrapper";
import axios from "axios";

function DepartmentMgrWrapper({ reloadKey }) {
    const [departments, setDepartments] = useState([]);
    const [filterDepartment, setFilterDepartment] = useState({ id: "", name: "" });
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [addDepartments, setAddDepartments] = useState([]);
    const [emptyError, setEmptyError] = useState(null);
    //const [idforChiefSurgeons, setIdforChiefSurgeons] = useState("");

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

    /*const addHandleSubmit = async () => {
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
    }*/

    const handleAdd = async (department) => {
        if (!department.id.trim()) {
            setEmptyError("*帳號欄位不得為空");
        } else {
            try {
                await axios.post(`${BASE_URL}/api/system/department/add`, department);
                const response = await axios.get(BASE_URL + "/api/system/departments");
                setDepartments(response.data);
                setEmptyError(null);
            } catch (error) {
                console.error("Error add data: ", error);
            }
        }
    }

    const handleDeleteAll = async (selectedDepartments) => {
        if (selectedDepartments.length === 0) {
            alert("請選擇要刪除的帳戶");
            return;
        }
        try {
            await axios.delete(`${BASE_URL}/api/system/departments/delete`, {
                data: selectedDepartments
            });
            const response = await axios.get(BASE_URL + "/api/system/departments");
            setDepartments(response.data);
            setSelectedDepartments([]);
        } catch (error) {
            console.error("Delete fail：", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/api/system/department/delete/${id}`);
            const response = await axios.get(BASE_URL + "/api/system/departments");
            setDepartments(response.data);
            setSelectedDepartments([]);
        } catch (error) {
            console.error("Delete fail：", error);
        }
    };

    return (
        <div key={reloadKey} className="mgr-wrapper">
            <DepartmentHeaderWrapper
                departments={departments}
                setDepartments={setDepartments}
                filterDepartment={filterDepartment}
                setFilterDepartment={setFilterDepartment}
                selectedDepartments={selectedDepartments}
                setSelectedDepartments={setSelectedDepartments}
                setEmptyError={setEmptyError}
                handleDelete={handleDeleteAll}
                addDepartments={addDepartments}
                setAddDepartments={setAddDepartments}
            />
            <DepartmentListWrapper
                departments={departments}
                setDepartments={setDepartments}
                filterDepartment={filterDepartment}
                selectedDepartments={selectedDepartments}
                setSelectedDepartments={setSelectedDepartments}
                handleDelete={handleDelete}
                addDepartments={addDepartments}
                setAddDepartments={setAddDepartments}
                handleAdd={handleAdd}
                emptyError={emptyError}
            />
        </div>
    )
}

export default DepartmentMgrWrapper;