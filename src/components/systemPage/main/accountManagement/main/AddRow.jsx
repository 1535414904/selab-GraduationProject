import { faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AddRow({ addUsers, setAddUsers, handleAdd }) {

    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const updated = [...addUsers];
        updated[index][name] = value;
        setAddUsers(updated);
    };

    const handleDelete = (index) => {
        const updated = addUsers.filter((user, idx) => idx !== index); // 根據索引刪除
        setAddUsers(updated);
    };

    return (
        <>
            {addUsers.map((user, index) => (
                <tr className="editable-row" key={index}>
                    <td></td>
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
                    <td>
                        <div className="action-buttons">
                            <FontAwesomeIcon className="edit-button" icon={faFloppyDisk} onClick={() => {handleAdd(user); handleDelete(index);}} />
                            <FontAwesomeIcon className="delete-button" icon={faTrash} onClick={() => handleDelete(index)} />
                        </div></td>
                </tr>
            ))}
        </>
    )
}

export default AddRow;