/* eslint-disable react/prop-types */
import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../../../../../config";

function HeaderWrapper({ users, setUsers, username, setUsername, name, setName, unit, setUnit, role, setRole, pageState, toggleState, deleteMode, setDeleteMode, selectedUsers, setSelectedUsers, addHandleSubmit }) {
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

    const handleDelete = async () => {
        if (selectedUsers.length === 0) {
            alert("請選擇要刪除的帳戶");
            return;
        }
        try {
            await axios.delete(`${BASE_URL}/api/system/users/delete`, {
                data: selectedUsers
            });
            setUsers(users.filter(user => !selectedUsers.includes(user.username)));
            setSelectedUsers([]);
            setDeleteMode(false);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };

    return (
        <div className="header-wrapper">
            <div className="title">
                <h1>帳號管理</h1>
            </div>

            {pageState === "list" && (
                <div className="header-function">
                    <div className="filter">篩選</div>

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
                            <div className="option" onClick={() => selectUnit("管理人員")}>管理人員</div>
                            <div className="option" onClick={() => selectUnit("泌尿科")}>泌尿科</div>
                            <div className="option" onClick={() => selectUnit("骨科")}>骨科</div>
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

                    {!deleteMode && <button onClick={() => toggleState("add")}>新增</button>}

                    {!deleteMode ? (
                        <button onClick={() => setDeleteMode(true)}>刪除</button>
                    ) : (
                        <>
                            <button onClick={handleDelete}>確認</button>
                            <button onClick={() => setDeleteMode(false)}>取消</button>
                        </>
                    )}
                </div>
            )}

            {pageState === "add" && (
                <div>
                    <button onClick={addHandleSubmit}>確認</button>
                    <button onClick={() => toggleState("list")}>返回</button>
                </div>
            )}
        </div>
    );
}

export default HeaderWrapper;
