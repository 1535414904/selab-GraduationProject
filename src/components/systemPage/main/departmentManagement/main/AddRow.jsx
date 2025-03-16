/* eslint-disable react/prop-types */
import { faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AddRow({ addDepartments, setAddDepartments, handleAdd, emptyError }) {
    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const updated = [...addDepartments];
        updated[index][name] = value;
        setAddDepartments(updated);
    };

    const handleDelete = (index) => {
        const updated = addDepartments.filter((department, idx) => idx !== index);
        setAddDepartments(updated);
    };

    return (
        <>
            {addDepartments.map((department, index) => (
                <tr className="editable-row" key={index}>
                    <td></td>
                    <td>
                        <input
                            type="text"
                            name="id"
                            value={department.id}
                            onChange={(e) => handleChange(index, e)}
                            placeholder="輸入科別編號"
                        />
                        <div className="error">{emptyError}</div>
                    </td>
                    <td>
                        <input
                            type="text"
                            name="name"
                            value={department.name}
                            onChange={(e) => handleChange(index, e)}
                            placeholder="輸入科別名稱"
                        />
                    </td>
                    <td>0</td>
                    <td>
                        {/* <div className="action-buttons">
                            <FontAwesomeIcon className="edit-button" icon={faFloppyDisk} onClick={() => {
                                handleAdd(department);
                                if (department.id.trim()) { handleDelete(index); }
                            }} />
                            <FontAwesomeIcon className="delete-button" icon={faTrash} onClick={() => handleDelete(index)} />
                        </div> */}
                        <div className="action-buttons">
                            {/* 儲存按鈕 */}
                            <button className="action-button edit-button" onClick={() => {
                                handleAdd(department);
                                if (department.id.trim()) { handleDelete(index); }
                            }}>
                                <FontAwesomeIcon icon={faFloppyDisk} className="action-icon" />
                            </button>

                            {/* 刪除按鈕 */}
                            <button className="action-button delete-button" onClick={() => handleDelete(index)}>
                                <FontAwesomeIcon icon={faTrash} className="action-icon" />
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </>
    )
}

export default AddRow;