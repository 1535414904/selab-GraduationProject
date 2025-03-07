import axios from "axios";
import { BASE_URL } from "../../../../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

/* eslint-disable react/prop-types */
function DepartmentHeaderWrapper({ departments, setDepartments,
    pageState, toggleState,
    filterDepartment, setFilterDepartment, 
    deleteMode, setDeleteMode,
    selectedDepartments, setSelectedDepartments,
    addHandleSubmit, setEmptyError }) {

    const handleChange = (e) => {
        setFilterDepartment(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const handleDelete = async () => {
        if (selectedDepartments.length === 0) {
            alert("請選擇要刪除的帳戶");
            return;
        }
        try {
            await axios.delete(`${BASE_URL}/api/system/departments/delete`, {
                data: selectedDepartments
            });
            setDepartments(departments.filter(department => !selectedDepartments.includes(department.id)));
            setSelectedDepartments([]);
            setDeleteMode(false);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };

    const handleBack = () => {
        toggleState("list");
        setEmptyError(null);
    }
    
    return (
        <div className="header-wrapper">
            <div className="title">
                <h1>科別管理</h1>
            </div>

            {pageState === "list" && (
                <div className="header-function">
                    <FontAwesomeIcon className="filter" icon={faMagnifyingGlass} />

                    <input
                        type="text"
                        name="id"
                        placeholder="請輸入科別編號"
                        value={filterDepartment.id}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="name"
                        placeholder="請輸入科別名稱"
                        value={filterDepartment.name}
                        onChange={handleChange}
                    />

                    {!deleteMode && <button className="account-button department-right-button" onClick={() => toggleState("add")}>新增</button>}
                
                    {!deleteMode ? (
                        <button className="account-button mgr-cancel" onClick={() => setDeleteMode(true)}>刪除</button>
                    ) : (
                        <div>
                            <button className="account-button department-right-button" onClick={handleDelete}>確認</button>
                            <button className="account-button mgr-cancel" onClick={() => setDeleteMode(false)}>取消</button>
                        </div>
                    )}
                </div>
            )}

            {pageState === "add" && (
                <div>
                    <button className="account-button" onClick={addHandleSubmit}>確認</button>
                    <button className="account-button mgr-cancel" onClick={handleBack}>返回</button>
                </div>
            )}
        </div>
    )
}

export default DepartmentHeaderWrapper;