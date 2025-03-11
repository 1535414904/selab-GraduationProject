import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

/* eslint-disable react/prop-types */
function DepartmentHeaderWrapper({ departments, setDepartments,
    filterDepartment, setFilterDepartment,
    selectedDepartments, setSelectedDepartments,
    setEmptyError, handleDelete,
    addDepartments, setAddDepartments }) {

    const handleChange = (e) => {
        setFilterDepartment(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const addRow = () => {
        setAddDepartments([...addDepartments, { id: "", name: "" }]);
    };

    return (
        <div className="header-wrapper">
            <div className="title">
                <h1>科別管理</h1>
            </div>

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

                <button className="account-button department-right-button" onClick={addRow}>新增</button>
                <button className="account-button mgr-cancel" onClick={() => handleDelete(selectedDepartments)}>刪除</button>
            </div>
        </div>
    );
}

export default DepartmentHeaderWrapper;