import React from "react";
import "./SurgeryModal.css";

function SurgeryModal({ surgery, onClose }) {
  if (!surgery) return null;

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
          <div className="info-group">
            <h3>基本資訊</h3>
            <p>
              <strong>申請編號：</strong> {surgery.applicationId}
            </p>
            <p>
              <strong>病歷號碼：</strong> {surgery.medicalRecordNumber}
            </p>
            <p>
              <strong>病患姓名：</strong> {surgery.patientName}
            </p>
            <p>
              <strong>手術日期：</strong> {surgery.date}
            </p>
          </div>

          <div className="info-group">
            <h3>手術資訊</h3>
            <p>
              <strong>手術名稱：</strong> {surgery.surgeryName}
            </p>
            <p>
              <strong>主刀醫師：</strong> {surgery.chiefSurgeonName}
            </p>
            <p>
              <strong>手術室：</strong> {surgery.operatingRoomName}
            </p>
            <p>
              <strong>預估時間：</strong> {surgery.estimatedSurgeryTime} 分鐘
            </p>
            <p>
              <strong>開始時間：</strong> {surgery.startTime}
            </p>
            <p>
              <strong>結束時間：</strong> {surgery.endTime}
            </p>
            <p>
              <strong>麻醉方式：</strong> {surgery.anesthesiaMethod}
            </p>
            <p>
              <strong>手術原因：</strong> {surgery.surgeryReason}
            </p>
          </div>

          <div className="info-group">
            <h3>其他資訊</h3>
            <p>
              <strong>特殊需求：</strong>{" "}
              {surgery.specialOrRequirements || "無"}
            </p>
            <p>
              <strong>申請人：</strong> {surgery.user?.name || "未指定"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurgeryModal;
