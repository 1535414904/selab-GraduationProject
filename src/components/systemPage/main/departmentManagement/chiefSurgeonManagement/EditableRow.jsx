/* eslint-disable react/prop-types */
import { faFloppyDisk, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function EditableRow({ key, chiefSurgeon, handleSave, onCancel }) {
    const [editedChiefSurgeon, setEditedChiefSurgeon] = useState({
        id: chiefSurgeon.id,
        name: chiefSurgeon.name,
    });

    const handleChange = (e) => {
        setEditedChiefSurgeon({
            ...editedChiefSurgeon,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <tr key={key} className="editable-row">
            <td></td>
            <td>
                <input
                    type="text"
                    name="id"
                    value={editedChiefSurgeon.id}
                    onChange={handleChange}
                />
            </td>
            <td>
                <input
                    type="text"
                    name="name"
                    value={editedChiefSurgeon.name}
                    onChange={handleChange}
                />
            </td>
            {/* <td><FontAwesomeIcon icon={faFloppyDisk} className="edit-button" onClick={() => handleSave(editedChiefSurgeon)} /></td> */}

            <td className="action-buttons">
                {/* 儲存按鈕 */}
                <button
                    className="action-button edit-button"
                    onClick={() => {
                        handleSave(editedChiefSurgeon); // 儲存當前的編輯內容
                    }}
                >
                    <FontAwesomeIcon icon={faFloppyDisk} className="action-icon" />
                </button>
                {/* 取消按鈕 */}
                <button
                    className="action-button delete-button"
                    onClick={() => {
                        setEditedChiefSurgeon({ ...chiefSurgeon }); // 還原原始資料
                        onCancel(); // 呼叫父元件的取消動作（例如退出編輯模式）
                    }}
                >
                    <FontAwesomeIcon icon={faTimes} className="action-icon" />
                </button>

            </td>
        </tr>
    )
}

export default EditableRow;