/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "../Mgr.css"
import { BASE_URL } from "../../../../config";
import DepartmentHeaderWrapper from "./header/DepartmentHeaderWrapper";
import DepartmentListWrapper from "./main/DepartmentListWrapper";
import axios from "axios";
import DepartmentFilter from "./DepartmentFilter";

function DepartmentMgrWrapper({ reloadKey }) {
    const [departments, setDepartments] = useState([]);
    const [filterDepartment, setFilterDepartment] = useState({ id: "", name: "" });
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [addDepartments, setAddDepartments] = useState([]);
    const [emptyError, setEmptyError] = useState({});
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

    useEffect(() => {
        console.log("科別資料", departments);
    }, [departments]);

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
            setEmptyError((prevErrors) => ({
                ...prevErrors,
                [department.uniqueId]: "*科別編號欄位不得為空",
            }));
            return;
        } else {
            try {
                await axios.post(`${BASE_URL}/api/system/department/add`, department);
                const response = await axios.get(BASE_URL + "/api/system/departments");
                setDepartments(response.data);
                setEmptyError((prevErrors) => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[department.uniqueId];
                    return newErrors;
                });
            } catch (error) {
                console.error("Error add data: ", error);
            }
        }
    }

    const handleDeleteAll = async (selectedDepartments) => {
        if (selectedDepartments.length === 0) {
            alert("請選擇要刪除的科別");
            return;
        }
    
        try {
            // 並行檢查所有選擇的科別是否有主治醫師
            const results = await Promise.all(
                selectedDepartments.map(department =>
                    axios.get(`${BASE_URL}/api/system/department/${department.id}/chief-surgeons`)
                )
            );
    
            // 篩選出有主治醫師的科別
            const departmentsWithChiefs = selectedDepartments.filter((department, index) => results[index].data.length > 0);
    
            if (departmentsWithChiefs.length > 0) {
                alert(`以下科別仍有主治醫師，無法刪除：${departmentsWithChiefs.map(department => department.name).join(", ")}`);
                return;
            }
    
            const isConfirmed = window.confirm(`請確認是否刪除這 ${selectedDepartments.length} 筆科別？`);
            if (!isConfirmed) {
                setSelectedDepartments([]); // 取消勾選
                return;
            }
    
            // 批量刪除科別
            await axios.delete(`${BASE_URL}/api/system/departments/delete`, {
                data: selectedDepartments.map(department => department.id) // 傳送部門的 id
            });
    
            // 重新獲取科別資料
            const response = await axios.get(`${BASE_URL}/api/system/departments`);
            setDepartments(response.data);
            setSelectedDepartments([]);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };
    
    

    const handleDelete = async (id, name) => {
        const response = await axios.get(`${BASE_URL}/api/system/department/${id}/chief-surgeons`);
        if (response.data.length > 0) {
            alert(`無法刪除科別 "${name}"，因為仍有主治醫師在此科別內。`);
            return;
        }

        const isConfirmed = window.confirm(`請確認是否刪除科別 ${id} ( 名稱: ${name} )？`);
        if (!isConfirmed) return;

        try {
            await axios.delete(`${BASE_URL}/api/system/department/delete/${id}`);

            // 重新獲取最新的科別資料
            const response = await axios.get(BASE_URL + "/api/system/departments");
            setDepartments(response.data);
            setSelectedDepartments([]);
        } catch (error) {
            console.error("刪除失敗：", error);
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
                setEmptyError={setEmptyError}
            />
            <DepartmentFilter
                departments={departments}
                filterDepartment={filterDepartment}
                setFilterDepartment={setFilterDepartment}
            />
        </div>
    )
}

export default DepartmentMgrWrapper;