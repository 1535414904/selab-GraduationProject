/* eslint-disable react/prop-types */
import { faPenSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import EditableDetail from "./EditableDetail";

function SurgeryDetail({ onClose, surgery, operatingRooms, handleSave }) {
    const [editingSurgery, setEditingSurgery] = useState(null);

    const handleEdit = (surgery) => {
        setEditingSurgery(surgery);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>手術詳細資訊</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    {/* <div className="info-group" style={{ textAlign: "left", alignItems: "flex-start", display: "flex", flexDirection: "column" }}> */}
                    {editingSurgery ? (<EditableDetail surgery={surgery} setEditingSurgery={setEditingSurgery} operatingRooms={operatingRooms} handleSave={handleSave}/>) : (
                        <>
                            <div className="info-group action-group">
                                <FontAwesomeIcon className="edit-button" icon={faPenSquare} onClick={() => handleEdit(surgery)} />
                                <FontAwesomeIcon className="delete-button" icon={faTrash} />
                            </div>

                            <div className="info-group blue flex flex-col items-start text-left">
                                <h3>基本資訊</h3>
                                <p>
                                    <strong>申請編號：</strong> {surgery.applicationId || '未指定'}
                                </p>
                                <p>
                                    <strong>病歷號碼：</strong> {surgery.medicalRecordNumber || '未指定'}
                                </p>
                                <p>
                                    <strong>病患姓名：</strong> {surgery.patientName || '未指定'}
                                </p>
                                <p>
                                    <strong>手術日期：</strong> {surgery.date || '未指定'}
                                </p>
                            </div>

                            <div className="info-group green" style={{ textAlign: "left", alignItems: "flex-start", display: "flex", flexDirection: "column" }}>
                                <h3>手術資訊</h3>
                                <p>
                                    <strong>手術名稱：</strong> {surgery.surgeryName || '未指定'}
                                </p>
                                <p>
                                    <strong>主刀醫師：</strong> {surgery.chiefSurgeonName || '未指定'}
                                </p>
                                <p>
                                    <strong>手術房：</strong> {surgery.operatingRoomName || '未指定'}
                                </p>
                                <p>
                                    <strong>預估時間：</strong> {surgery.estimatedSurgeryTime || '未指定'} {surgery.estimatedSurgeryTime ? '分鐘' : ''}
                                </p>
                                <p>
                                    <strong>開始時間：</strong> {surgery.startTime}
                                </p>
                                <p>
                                    <strong>結束時間：</strong> {surgery.endTime}
                                </p>
                                <p>
                                    <strong>麻醉方式：</strong> {surgery.anesthesiaMethod || '未指定'}
                                </p>
                                <p>
                                    <strong>手術原因：</strong> {surgery.surgeryReason || '未指定'}
                                </p>
                            </div>

                            <div className="info-group pink" style={{ textAlign: "left", alignItems: "flex-start", display: "flex", flexDirection: "column" }}>
                                <h3>其他資訊</h3>
                                <p>
                                    <strong>特殊需求：</strong>{" "}
                                    {surgery.specialOrRequirements || "無"}
                                </p>
                                <p>
                                    <strong>申請人：</strong> {surgery.user?.name || "未指定"}
                                </p>
                            </div>
                        </>)}

                </div>
            </div>
        </div>
    )
}

export default SurgeryDetail;