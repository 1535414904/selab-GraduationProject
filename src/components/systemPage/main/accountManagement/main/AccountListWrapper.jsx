/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";
import EditableRow from "./EditableRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import AddRow from "./AddRow";

function AccountListWrapper({ users, setUsers,
    username, name, unit, role,
    selectedUsers, setSelectedUsers, handleDelete, addUsers, setAddUsers, handleAdd, emptyError }) {

    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    const roleDisplayMap = {
        1: <p>查看者</p>,
        2: <p>編輯者</p>,
        3: <p>管理者</p>,
    };

    useEffect(() => {
        if (!users.length) return;

        const roleMap = {
            管理者: 3,
            編輯者: 2,
            查看者: 1,
        };

        const newFilteredUsers = users.filter(user => {
            const matchesUsername = username ? user.username.toLowerCase().includes(username.toLowerCase()) : true;
            const matchesName = name ? user.name.toLowerCase().includes(name.toLowerCase()) : true;
            const matchesUnit = unit ? user.unit.toLowerCase() === unit.toLowerCase() : true;
            const matchesRole = role ? user.role === roleMap[role] : true;

            return matchesUsername && matchesName && matchesUnit && matchesRole;
        });

        const sortedUsers = newFilteredUsers.sort((a, b) => b.role - a.role);

        setFilteredUsers(sortedUsers);
    }, [username, name, unit, role, users]);

    const handleEdit = (user) => {
        console.log("🔍 現在正在編輯的使用者：", user);
        setEditingUser(user);
    };

    const handleSave = async (updatedUser) => {
        try {
            await axios.put(`${BASE_URL}/api/system/user/${updatedUser.username}`, updatedUser);
            setUsers(users.map(user => (user.username === updatedUser.username ? updatedUser : user)));
            setEditingUser(null);
        } catch (error) {
            console.error("updated error：", error);
        }
    };

    const handleCheckboxChange = (username) => {
        setSelectedUsers((prevSelected) =>
            prevSelected.includes(username)
                ? prevSelected.filter(user => user !== username)
                : [...prevSelected, username]
        );
    };

    return (
        <div className="mgr-list">
            <table className="system-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>帳號</th>
                        <th>姓名</th>
                        <th>單位</th>
                        <th>權限</th>
                        <th>電子信箱</th>
                        <th>動作</th>
                    </tr>
                </thead>
                <tbody>
                    <AddRow
                        addUsers={addUsers}
                        setAddUsers={setAddUsers}
                        handleAdd={handleAdd}
                        emptyError={emptyError}
                    />
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            editingUser?.username === user.username ? (
                                <EditableRow key={user.username} user={user} handleSave={handleSave} />
                            ) : (
                                <tr key={user.username}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.username)}
                                            onChange={() => handleCheckboxChange(user.username)}
                                        />
                                    </td>
                                    <td>{user.username}</td>
                                    <td>{user.name}</td>
                                    <td>{user.unit}</td>
                                    <td>{roleDisplayMap[user.role]}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <FontAwesomeIcon className="edit-button" icon={faPenSquare} onClick={() => handleEdit(user)} />
                                            <FontAwesomeIcon className="delete-button" icon={faTrash} onClick={() => { handleDelete(user.username); }} />
                                        </div>
                                    </td>
                                </tr>
                            )
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">無符合條件的資料</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AccountListWrapper;
