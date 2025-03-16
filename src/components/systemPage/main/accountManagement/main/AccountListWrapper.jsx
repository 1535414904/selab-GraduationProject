/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";
import EditableRow from "./EditableRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import AddRow from "./AddRow";
import "../../Mgr.css";

function AccountListWrapper({ users, setUsers,
    username, name, unit, role, filterUser,
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

        const newFilteredUsers = users.filter(user => {
            const matchesUsername = filterUser.username
                ? user.username.toLowerCase().includes(filterUser.username.toLowerCase())
                : true;
            const matchesName = filterUser.name
                ? user.name.toLowerCase().includes(filterUser.name.toLowerCase())
                : true;
            const matchesUnit = filterUser.unit
                ? user.unit.toLowerCase().includes(filterUser.unit.toLowerCase())
                : true;
            const matchesRole = filterUser.role
                ? user.role == filterUser.role
                : true;

            return matchesUsername && matchesName && matchesUnit && matchesRole;
        });

        const sortedUsers = newFilteredUsers.sort((a, b) => b.role - a.role);

        setFilteredUsers(sortedUsers);
    }, [filterUser.name, filterUser.role, filterUser.unit, filterUser.username, role, unit, users]);

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
                        <th>選取</th>
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
                                <EditableRow
                                    key={user.username}
                                    user={user}
                                    handleSave={handleSave}
                                    setIsEditing={setEditingUser} // 傳遞 setEditingUser 來控制編輯模式
                                />
                            ) : (
                                // <tr key={user.username}>
                                //     <td>
                                //         <input
                                //             type="checkbox"
                                //             checked={selectedUsers.includes(user.username)}
                                //             onChange={() => handleCheckboxChange(user.username)}
                                //         />
                                //     </td>
                                //     <td>{user.username}</td>
                                //     <td>{user.name}</td>
                                //     <td>{user.unit}</td>
                                //     <td>{roleDisplayMap[user.role]}</td>
                                //     <td>{user.email}</td>
                                //     <td>
                                //         <div className="action-buttons">
                                //             <FontAwesomeIcon className="edit-button" icon={faPenSquare} onClick={() => handleEdit(user)} />
                                //             <FontAwesomeIcon className="delete-button" icon={faTrash} onClick={() => { handleDelete(user.username); }} />
                                //         </div>
                                //     </td>
                                // </tr>
                                <tr
                                    key={user.username}
                                    className={selectedUsers.includes(user.username) ? "selected" : "unselected"}
                                >

                                    {/* <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.username)}
                                            onChange={() => handleCheckboxChange(user.username)}
                                        />
                                    </td> */}
                                    <td
                                        onClick={() => handleCheckboxChange(user.username)}
                                        className={`selectable-cell ${selectedUsers.includes(user.username) ? "selected" : ""}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.username)}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => handleCheckboxChange(user.username)}
                                            className="checkbox"
                                        />
                                    </td>
                                    <td>{user.username}</td>
                                    <td>{user.name}</td>
                                    <td>{user.unit}</td>
                                    <td>{roleDisplayMap[user.role]}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        {/* <div className="action-buttons">
                                            <FontAwesomeIcon className="edit-button" icon={faPenSquare} onClick={() => handleEdit(user)} />
                                            <FontAwesomeIcon className="delete-button" icon={faTrash} onClick={() => { handleDelete(user.username); }} />
                                        </div> */}
                                        <div className="action-buttons">
                                            {/* 編輯按鈕 */}
                                            <button onClick={() => handleEdit(user)} className="action-button edit-button">
                                                <FontAwesomeIcon icon={faPenSquare} className="action-icon" />
                                            </button>

                                            {/* 刪除按鈕 */}
                                            <button onClick={() => handleDelete(user.username)} className="action-button delete-button">
                                                <FontAwesomeIcon icon={faTrash} className="action-icon" />
                                            </button>
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
