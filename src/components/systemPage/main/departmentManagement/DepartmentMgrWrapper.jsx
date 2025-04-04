/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "../Mgr.css"
import { BASE_URL } from "../../../../config";
import DepartmentHeaderWrapper from "./header/DepartmentHeaderWrapper";
import DepartmentListWrapper from "./main/DepartmentListWrapper";
import axios from "axios";
import DepartmentFilter from "./DepartmentFilter";

function DepartmentMgrWrapper({ reloadKey, refreshKey, setRefreshKey }) {
    const [departments, setDepartments] = useState([]);
    const [filterDepartment, setFilterDepartment] = useState({ id: "", name: "" });
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [addDepartments, setAddDepartments] = useState([]);
    const [emptyError, setEmptyError] = useState({});
    const [isOpen, setIsOpen] = useState(false);

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
        let errors = {};

        // 確保錯誤訊息的 key 是唯一的
        const idErrorKey = `${department.uniqueId}-id`;
        const nameErrorKey = `${department.uniqueId}-name`;

        // 檢查是否為空
        if (!department.id.trim()) {
            errors[idErrorKey] = "*科別編號欄位不得為空";
        } else {
            // 只有在不為空的情況下，才檢查是否重複
            const isDuplicateId = departments.some(existingDepartment => existingDepartment.id === department.id);
            if (isDuplicateId) {
                errors[idErrorKey] = `科別編號 "${department.id}" 已存在，請使用其他編號`;
            } else {
                delete errors[idErrorKey];// 清除錯誤訊息
            }
        }

        if (!department.name.trim()) {
            errors[nameErrorKey] = "*科別名稱欄位不得為空";
        } else {
            // 只有在不為空的情況下，才檢查是否重複
            const isDuplicateName = departments.some(existingDepartment => existingDepartment.name === department.name);
            if (isDuplicateName) {
                errors[nameErrorKey] = `科別名稱 "${department.name}" 已存在，請使用其他名稱`;
            } else {
                delete errors[nameErrorKey] // 清除錯誤訊息
            }
        }

        // 如果有錯誤，設定錯誤訊息並中止新增
        if (Object.keys(errors).length > 0) {
            setEmptyError(prevErrors => ({ ...prevErrors, ...errors }));
            return;
        }

        // 若無錯誤，清除該列的錯誤訊息
        setEmptyError(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[idErrorKey];
            delete newErrors[nameErrorKey];
            return newErrors;
        });

        try {
            await axios.post(`${BASE_URL}/api/system/department/add`, department);
            const response = await axios.get(BASE_URL + "/api/system/departments");
            setDepartments(response.data);
            cleanAddRow(department.uniqueId); // 刪除新增的科別
        } catch (error) {
            console.error("Error add data: ", error);
        }
    };



    const cleanAddRow = (uniqueId) => {
        const updated = addDepartments.filter((department) => department.uniqueId !== uniqueId);
        setAddDepartments(updated);
        setEmptyError((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[uniqueId]; // 根據 uniqueId 刪除錯誤
            return newErrors;
        });
    };

    // const handleDeleteAll = async (selectedDepartments) => {
    //     if (selectedDepartments.length === 0) {
    //         alert("請選擇要刪除的科別");
    //         return;
    //     }

    //     try {
    //         // 並行檢查所有選擇的科別是否有主治醫師
    //         const results = await Promise.all(
    //             selectedDepartments.map(department =>
    //                 axios.get(`${BASE_URL}/api/system/department/${department.id}/chief-surgeons`)
    //             )
    //         );

    //         // 篩選出有主治醫師的科別
    //         const departmentsWithChiefs = selectedDepartments.filter((department, index) => results[index].data.length > 0);

    //         if (departmentsWithChiefs.length > 0) {
    //             alert(`以下科別仍有主治醫師，無法刪除：${departmentsWithChiefs.map(department => department.name).join(", ")}`);
    //             setSelectedDepartments([]); // 取消勾選
    //             return;
    //         }

    //         const isConfirmed = window.confirm(`請確認是否刪除這 ${selectedDepartments.length} 筆科別？`);
    //         if (!isConfirmed) {
    //             setSelectedDepartments([]); // 取消勾選
    //             return;
    //         }

    //         // 批量刪除科別
    //         await axios.delete(`${BASE_URL}/api/system/departments/delete`, {
    //             data: selectedDepartments.map(department => department.id) // 傳送部門的 id
    //         });

    //         // 重新獲取科別資料
    //         const response = await axios.get(`${BASE_URL}/api/system/departments`);
    //         setDepartments(response.data);
    //         setSelectedDepartments([]);
    //     } catch (error) {
    //         console.error("刪除失敗：", error);
    //     }
    // };
    //* 這個函式會檢查選擇的科別是否有主治醫師，然後刪除科別 */
    // 因為 selectedDepartments 僅包含 ID，無法直接取得科別名稱，因此需從 departments 裡查出完整資料以支援檢查與提示訊息。
    const handleDeleteAll = async (selectedIds) => {
        if (selectedIds.length === 0) {
            alert("請選擇要刪除的科別");
            return;
        }

        try {
            // 根據 ID 從 departments 中找出完整物件（包含 name）
            const selectedDepartmentsData = departments.filter(dept =>
                selectedIds.includes(dept.id)
            );

            // 檢查是否有主治醫師
            const results = await Promise.all(
                selectedDepartmentsData.map(dept =>
                    axios.get(`${BASE_URL}/api/system/department/${dept.id}/chief-surgeons`)
                )
            );

            const departmentsWithChiefs = selectedDepartmentsData.filter((dept, index) => results[index].data.length > 0);

            if (departmentsWithChiefs.length > 0) {
                alert(`以下科別仍有主治醫師，無法刪除：${departmentsWithChiefs.map(dept => dept.name).join(", ")}`);
                setSelectedDepartments([]);
                return;
            }

            const isConfirmed = window.confirm(`請確認是否刪除這 ${selectedDepartmentsData.length} 筆科別？`);
            if (!isConfirmed) {
                setSelectedDepartments([]);
                return;
            }

            await axios.delete(`${BASE_URL}/api/system/departments/delete`, {
                data: selectedDepartmentsData.map(dept => dept.id)
            });

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
            setSelectedDepartments([]); // 取消勾選
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

    // return (
    //     <div key={reloadKey} className="mgr-wrapper relative overflow-hidden">
    //         <DepartmentHeaderWrapper
    //             departments={departments}
    //             setDepartments={setDepartments}
    //             filterDepartment={filterDepartment}
    //             setFilterDepartment={setFilterDepartment}
    //             selectedDepartments={selectedDepartments}
    //             setSelectedDepartments={setSelectedDepartments}
    //             setEmptyError={setEmptyError}
    //             handleDelete={handleDeleteAll}
    //             addDepartments={addDepartments}
    //             setAddDepartments={setAddDepartments}
    //         />
    //         <DepartmentListWrapper
    //             departments={departments}
    //             setDepartments={setDepartments}
    //             filterDepartment={filterDepartment}
    //             selectedDepartments={selectedDepartments}
    //             setSelectedDepartments={setSelectedDepartments}
    //             handleDelete={handleDelete}
    //             addDepartments={addDepartments}
    //             setAddDepartments={setAddDepartments}
    //             handleAdd={handleAdd}
    //             emptyError={emptyError}
    //             setEmptyError={setEmptyError}
    //             refreshKey={refreshKey}
    //             setRefreshKey={setRefreshKey}
    //         />
    //         <DepartmentFilter
    //             departments={departments}
    //             filterDepartment={filterDepartment}
    //             setFilterDepartment={setFilterDepartment}
    //         />
    //     </div>
    // )
    return (
        <div key={reloadKey} className="mgr-wrapper relative overflow-hidden">
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

            <div className="flex w-full transition-all duration-500 ease-in-out">
                {/* 篩選器滑入區塊 */}
                {isOpen && (
                    <div className="w-72 shrink-0 transition-all duration-500 ease-in-out">
                        <DepartmentFilter
                            isOpen={isOpen}
                            departments={departments}
                            filterDepartment={filterDepartment}
                            setFilterDepartment={setFilterDepartment}
                            onClose={() => setIsOpen(false)}
                        />
                    </div>
                )}

                {/* 表格內容會自動收縮 */}
                <div className={`flex-1 transition-all duration-500 ease-in-out relative`}>
                    {!isOpen && (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="absolute top-4 left-4 z-20 bg-blue-500 text-white px-3 py-2 rounded shadow"
                        >
                            篩選
                        </button>
                    )}

                    <div className="p-4">
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
                            refreshKey={refreshKey}
                            setRefreshKey={setRefreshKey}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

}

export default DepartmentMgrWrapper;