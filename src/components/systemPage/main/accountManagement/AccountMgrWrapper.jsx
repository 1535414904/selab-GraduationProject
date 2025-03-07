/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "../Mgr.css"
import AccountListWrapper from "./main/AccountListWrapper";
import { BASE_URL } from "../../../../config";
import axios from "axios";
import AccountAddWrapper from "./main/AccountAddWrapper";
import AccountHeaderWrapper from "./header/AccountHeaderWrapper";

function AccountMgrWrapper({ reloadKey }) {
    const [users, setUsers] = useState([]);
    const [pageState, setPageState] = useState("list");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("");
    const [role, setRole] = useState("");
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [addUsers, setAddUsers] = useState([
        { username: "", name: "", unit: "", role: 1, email: "" }
    ]);
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

    const addHandleSubmit = async () => {
        const hasEmptyField = addUsers.some(user => !user.username.trim());
        if (hasEmptyField) {
            setEmptyError("*帳號欄位不得為空");
        } else {
            try {
                await axios.post(BASE_URL + "/api/system/users/add", addUsers);
                const response = await axios.get(BASE_URL + "/api/system/users");
                setUsers(response.data);
                setEmptyError(null);
                setPageState("list");
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
        try {
            await axios.delete(`${BASE_URL}/api/system/users/delete`, {
                params: {selectedUsers}
            });
            const response = await axios.get(BASE_URL + "/api/system/users");
            setUsers(response.data);
            setSelectedUsers([]);
            setDeleteMode(false);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };

    const handleDelete = async (username) => {
        try {
            await axios.delete(`${BASE_URL}/api/system/user/delete/${username}`);
            const response = await axios.get(BASE_URL + "/api/system/users");
            setUsers(response.data);
            setSelectedUsers([]);
            setDeleteMode(false);
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
                pageState={pageState}
                toggleState={setPageState}
                deleteMode={deleteMode}
                setDeleteMode={setDeleteMode}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                addHandleSubmit={addHandleSubmit}
                setEmptyError={setEmptyError}
                handleDelete={handleDeleteAll}
            />
            {pageState === "list" && (
                <AccountListWrapper
                    users={users}
                    setUsers={setUsers}
                    username={username}
                    name={name}
                    unit={unit}
                    role={role}
                    deleteMode={deleteMode}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    handleDelete={handleDelete}
                />
            )}
            {pageState === "add" && (
                <AccountAddWrapper
                    users={addUsers}
                    setUsers={setAddUsers}
                    emptyError={emptyError}
                />
            )}
        </div>
    );
}

export default AccountMgrWrapper;
