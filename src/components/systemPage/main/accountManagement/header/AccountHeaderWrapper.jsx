/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function AccountHeaderWrapper({ users, setUsers,
    username, setUsername,
    name, setName,
    unit, setUnit,
    role, setRole,
    pageState, toggleState,
    deleteMode, setDeleteMode,
    selectedUsers, setSelectedUsers,
    addHandleSubmit, setEmptyError,
    handleDelete, addUsers, setAddUsers }) {

    const [unitOpen, setUnitOpen] = useState(false);
    const [roleOpen, setRoleOpen] = useState(false);

    const toggleUnitSelect = () => setUnitOpen(!unitOpen);
    const toggleRoleSelect = () => setRoleOpen(!roleOpen);

    const selectUnit = (value) => {
        setUnit(value);
        setUnitOpen(false);
    };

    const selectRole = (value) => {
        setRole(value);
        setRoleOpen(false);
    };

    const clearUnit = () => {
        setUnit("");
        setUnitOpen(false);
    };

    const clearPermission = () => {
        setRole("");
        setRoleOpen(false);
    };

    const handleBack = () => {
        toggleState("list");
        setEmptyError(null);
    }

    const addRow = () => {
        setAddUsers([...addUsers, { username: "", name: "", unit: "", role: 1, email: "" }]);
    };

    return (
        <div className="header-wrapper">
            <div className="title">
                <h1>帳號管理</h1>
            </div>

            <div className="header-function">

                <FontAwesomeIcon className="filter" icon={faMagnifyingGlass} />

                <input
                    placeholder="請輸入帳號"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    placeholder="請輸入姓名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <div className={`custom-select ${unitOpen ? "open" : ""}`} onClick={toggleUnitSelect}>
                    <div className="select-box">
                        <span className="select-text">{unit || "選擇單位"}</span>
                        <i className="arrow">▼</i>
                    </div>
                    <div className="options">
                        {[...new Set(users.map(user => user.unit))].map((unitOption) => (
                            <div key={unitOption} className="option" onClick={() => selectUnit(unitOption)}>
                                {unitOption}
                            </div>
                        ))}
                        <div className="option clear-option" onClick={clearUnit}>清空</div>
                    </div>
                </div>

                <div className={`custom-select ${roleOpen ? "open" : ""}`} onClick={toggleRoleSelect}>
                    <div className="select-box">
                        <span className="select-text">{role || "選擇權限"}</span>
                        <i className="arrow">▼</i>
                    </div>
                    <div className="options">
                        <div className="option" onClick={() => selectRole("管理者")}>管理者</div>
                        <div className="option" onClick={() => selectRole("編輯者")}>編輯者</div>
                        <div className="option" onClick={() => selectRole("查看者")}>查看者</div>
                        <div className="option clear-option" onClick={clearPermission}>清空</div>
                    </div>
                </div>

                <button className="account-button account-right-button" onClick={addRow}>新增</button>    
                <button className="account-button mgr-cancel" onClick={() => handleDelete(selectedUsers)}>刪除</button>

            </div>

            {pageState === "add" && (
                <div>
                    <button className="account-button" onClick={addHandleSubmit}>確認</button>
                    <button className="account-button mgr-cancel" onClick={handleBack}>返回</button>
                </div>
            )}
        </div>
    );
}

export default AccountHeaderWrapper;
