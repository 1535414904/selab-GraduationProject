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

    const addRow = () => {
        setAddUsers([...addUsers, { username: "", name: "", unit: "", role: 1, email: "" }]);
    };

    return (
        <div className="header-wrapper">
            <div className="title">
                <h1>帳號管理</h1>
            </div>

            <div className="header-function">
                <button className="account-button" onClick={addRow}>新增</button>    
                <button className="account-button mgr-cancel" onClick={() => handleDelete(selectedUsers)}>刪除</button>

            </div>
        </div>
    );
}

export default AccountHeaderWrapper;
