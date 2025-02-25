/* eslint-disable react/prop-types */
function AccountAddWrapper({ users, setUsers, emptyError }) {
    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const updatedUsers = [...users];
        updatedUsers[index][name] = value;
        setUsers(updatedUsers);
    };

    const addRow = () => {
        setUsers([...users, { username: "", name: "", unit: "", role: 1, email: "" }]);
    };

    const removeRow = () => {
        if (users.length > 1) {
            setUsers(users.slice(0, -1));
        }
    };

    return (
        <div className="mgr-list">
            <table className="system-table">
                <thead>
                    <tr>
                        <th>帳號</th>
                        <th>姓名</th>
                        <th>單位</th>
                        <th>權限</th>
                        <th>電子信箱</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user, index) => (
                        <tr className="editable-row" key={index}>
                            <td>
                                <input
                                    type="text"
                                    name="username"
                                    value={user.username}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="輸入帳號"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="name"
                                    value={user.name}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="輸入姓名"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="unit"
                                    value={user.unit}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="輸入單位"
                                />
                            </td>
                            <td>
                                <select name="role" value={user.role} onChange={(e) => handleChange(index, e)}>
                                    <option value={1}>查看者</option>
                                    <option value={2}>編輯者</option>
                                    <option value={3}>管理者</option>
                                </select>
                            </td>
                            <td>
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="輸入電子信箱"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p className="error">{emptyError}</p>

            <div>
                <button className="row-button" onClick={addRow}>➕</button>
                <button className="row-button" onClick={removeRow}>➖</button>
            </div>
        </div>
    );
}

export default AccountAddWrapper;