function SurgeryDetail({ surgery, onClose }) {
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
                    <div className="info-group flex flex-col items-start text-left">
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
                    
                    <div className="info-group green"  style={{ textAlign: "left", alignItems: "flex-start", display: "flex", flexDirection: "column" }}>
                    <h3>手術資訊</h3>
                    <p>
                        <strong>手術名稱：</strong> {surgery.surgeryName || '未指定'}
                    </p>
                    <p>
                        <strong>主刀醫師：</strong> {surgery.chiefSurgeonName || '未指定'}
                    </p>
                    <p>
                        <strong>手術室：</strong> {surgery.operatingRoomName || '未指定'}
                    </p>
                    <p>
                        <strong>預估時間：</strong> {surgery.estimatedSurgeryTime || '未指定'} {surgery.estimatedSurgeryTime ? '分鐘' : ''}
                    </p>
                </div>
               </div>
            </div>
        </div>
    )
}

export default SurgeryDetail;