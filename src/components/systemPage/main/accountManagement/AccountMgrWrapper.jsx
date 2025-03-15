/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "../Mgr.css"
import AccountListWrapper from "./main/AccountListWrapper";
import { BASE_URL } from "../../../../config";
import axios from "axios";
import AccountHeaderWrapper from "./header/AccountHeaderWrapper";
import AccountFilter from "./AccountFilter";

function AccountMgrWrapper({ reloadKey }) {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("");
    const [role, setRole] = useState("");
    const [filterUser, setFilterUser] = useState({
        username: "", name: "", unit: "", role: null
    })
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [addUsers, setAddUsers] = useState([]);
    const [emptyError, setEmptyError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(BASE_URL + "/api/system/users");
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log(users);
    }, [users])

    const handleAdd = async (user) => {
        if (!user.username.trim()) {
            setEmptyError("*帳號欄位不得為空");
        } else {
            try {
                console.log("User:", user);
                await axios.post(`${BASE_URL}/api/system/user/add`, user);
                const response = await axios.get(BASE_URL + "/api/system/users");
                setUsers(response.data);
                setEmptyError(null);
            } catch (error) {
                console.log("Error add data: ", error);
            }
        }
    }

    const handleDeleteAll = async (selectedUsers) => {
        if (selectedUsers.length === 0) {
            alert("請選擇要刪除的帳戶");
            return;
        }
        const isConfirmed = window.confirm(`請確認是否刪除這 ${selectedUsers.length} 筆帳號`);
        if (!isConfirmed) {
            setSelectedUsers([]); // 取消勾選
            return;
        }

        try {
            await axios.delete(`${BASE_URL}/api/system/users/delete`, {
                data: selectedUsers
            });
            const response = await axios.get(BASE_URL + "/api/system/users");
            setUsers(response.data);
            setSelectedUsers([]);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };

    const handleDelete = async (username) => {
        const isConfirmed = window.confirm(`請確認是否刪除帳號 ${username} `);
        if (!isConfirmed) return;

        try {
            await axios.delete(`${BASE_URL}/api/system/user/delete/${username}`);
            const response = await axios.get(BASE_URL + "/api/system/users");
            setUsers(response.data);
            setSelectedUsers([]);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };

    return (
        <div key={reloadKey} className="mgr-wrapper">
            <AccountHeaderWrapper
                users={users}
                setUsers={setUsers}
                username={username}
                setUsername={setUsername}
                name={name}
                setName={setName}
                unit={unit}
                setUnit={setUnit}
                role={role}
                setRole={setRole}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                setEmptyError={setEmptyError}
                handleDelete={handleDeleteAll}
                addUsers={addUsers}
                setAddUsers={setAddUsers}
            />
            <AccountListWrapper
                users={users}
                setUsers={setUsers}
                username={username}
                name={name}
                unit={unit}
                role={role}
                filterUser={filterUser}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                handleDelete={handleDelete}
                addUsers={addUsers}
                setAddUsers={setAddUsers}
                handleAdd={handleAdd}
                emptyError={emptyError}
            />
            <AccountFilter
                users={users}
                filterUser={filterUser}
                setFilterUser={setFilterUser}
            />
        </div>
    );
}

export default AccountMgrWrapper;
