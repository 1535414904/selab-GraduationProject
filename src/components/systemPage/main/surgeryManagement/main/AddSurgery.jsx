import { faFloppyDisk, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import Select from "react-select";
import { BASE_URL } from "../../../../../config";
import axios from "axios";

function AddSurgery({ onClose, operatingRooms, nowUsername, addingSurgery, setReloadKey }) {
    const [addSurgery, setAddSurgery] = useState({
        applicationId: "",
        date: "",
        medicalRecordNumber: "",
        patientName: "",
        surgeryName: "",
        anesthesiaMethod: "",
        surgeryReason: "",
        prioritySequence: 0,
        specialOrRequirements: "",
        estimatedSurgeryTime: 0,
        username: nowUsername,
        operatingRoomId: addingSurgery,
        chiefSurgeonId: ""
    })
    const [chiefSurgeons, setChiefSurgeons] = useState([]);
    const [emptyError, setEmptyError] = useState("");

    useEffect(() => {
        console.log(addSurgery);
    }, [addSurgery])

    const handleChange = (e) => {
        const { name, value } = e.target;

        setAddSurgery({
            ...addSurgery,
            [name]: name === "estimatedSurgeryTime" ? Number(value) || 0 : value
        });
    };

    const handleOperatingRoomsChange = (selectedOption) => {
        setAddSurgery({
            ...addSurgery,
            operatingRoomId: selectedOption ? selectedOption.value : null
        });
    };

    const handleChiefSurgeonChange = (selectedOption) => {
        setAddSurgery({
            ...addSurgery,
            chiefSurgeonId: selectedOption ? selectedOption.value : null
        });
    };

    useEffect(() => {
        const fetchChiefSurgeons = async () => {
            if (!addSurgery.operatingRoomId) return;

            const selectedDepartmentId = operatingRooms.find(room => room.id === addSurgery.operatingRoomId)?.department.id;

            if (!selectedDepartmentId) return;

            try {
                const response = await axios.get(`${BASE_URL}/api/system/department/${selectedDepartmentId}/chief-surgeons`);
                setChiefSurgeons(response.data);
            } catch (error) {
                console.error("Error fetching chief surgeons: ", error);
            }
        };

        fetchChiefSurgeons();
    }, [addSurgery.operatingRoomId, operatingRooms]);

    const handleAdd = async (surgery) => {
        if (!surgery.applicationId.trim()) {
            setEmptyError("*申請序號欄位不得為空");
        } else {
            try {
                await axios.post(`${BASE_URL}/api/system/surgery/add`, surgery);
                setEmptyError(null);
                setReloadKey((prevKey) => prevKey + 1);
                onClose();
            } catch (error) {
                console.error("Error add data: ", error);
            }
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>新增手術</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    <div className="info-group action-group">
                        <button
                            className="action-button edit-button"
                            onClick={() => handleAdd(addSurgery)}>
                            <FontAwesomeIcon icon={faFloppyDisk} className="action-icon" />
                        </button>
                        <button
                            className="action-button delete-button"
                            onClick={onClose}>
                            <FontAwesomeIcon icon={faTimes} className="action-icon" />
                        </button>
                    </div>

                    <div className="info-group blue flex flex-col items-start text-left">
                        <h3>基本資訊</h3>
                        <p>
                            <strong>申請編號：</strong>
                            <input type="text" name="applicationId" value={addSurgery.applicationId}
                                onChange={handleChange} />
                        </p>
                        <p>
                            <strong>病歷號碼：</strong>
                            <input type="text" name="medicalRecordNumber" value={addSurgery.medicalRecordNumber}
                                onChange={handleChange} />
                        </p>
                        <p>
                            <strong>病患姓名：</strong>
                            <input type="text" name="patientName" value={addSurgery.patientName}
                                onChange={handleChange} />
                        </p>
                        <p>
                            <strong>手術日期：</strong>
                            <input type="text" name="date" value={addSurgery.date}
                                onChange={handleChange} />
                        </p>
                    </div>

                    <div className="info-group green" style={{ textAlign: "left", alignItems: "flex-start", display: "flex", flexDirection: "column" }}>
                        <h3>手術資訊</h3>
                        <p>
                            <strong>手術名稱：</strong>
                            <input type="text" name="surgeryName" value={addSurgery.surgeryName}
                                onChange={handleChange} />
                        </p>
                        <p>
                            <strong>主刀醫師：</strong>
                            <Select
                                className=""
                                options={chiefSurgeons.map((chiefSurgeon) => ({ value: chiefSurgeon.id, label: chiefSurgeon.name }))}
                                onChange={handleChiefSurgeonChange}
                            />
                        </p>
                        <p>
                            <strong>手術房：</strong>
                            <Select
                                className=""
                                options={operatingRooms.map((operatingRoom) => ({ value: operatingRoom.id, label: operatingRoom.name }))}
                                onChange={handleOperatingRoomsChange}
                                defaultValue={operatingRooms.find(
                                    (room) => room.id === addingSurgery
                                )
                                    ? { value: addingSurgery, label: operatingRooms.find(room => room.id === addingSurgery).name }
                                    : null}
                            />
                        </p>
                        <p>
                            <strong>預估時間：</strong>
                            <input type="number" name="estimatedSurgeryTime" value={addSurgery.estimatedSurgeryTime}
                                onChange={handleChange} />
                            {addSurgery.estimatedSurgeryTime ? '分鐘' : ''}
                        </p>
                        <p>
                            <strong>開始時間：</strong> null
                        </p>
                        <p>
                            <strong>結束時間：</strong> null
                        </p>
                        <p>
                            <strong>麻醉方式：</strong>
                            <input type="text" name="anesthesiaMethod" value={addSurgery.anesthesiaMethod}
                                onChange={handleChange} />
                        </p>
                        <p>
                            <strong>手術原因：</strong>
                            <textarea
                                className="surgery-reason"
                                name="surgeryReason"
                                value={addSurgery.surgeryReason}
                                onChange={handleChange}
                                rows="4"
                                cols="50"
                            />
                        </p>
                    </div>

                    <div className="info-group pink" style={{ textAlign: "left", alignItems: "flex-start", display: "flex", flexDirection: "column" }}>
                        <h3>其他資訊</h3>
                        <p>
                            <strong>特殊需求：</strong>{" "}
                            <textarea
                                className="surgery-reason"
                                name="specialOrRequirements"
                                value={addSurgery.specialOrRequirements}
                                onChange={handleChange}
                                rows="4"
                                cols="50"
                            />
                        </p>
                        <p>
                            <strong>申請人：</strong> {nowUsername || "未指定"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddSurgery;