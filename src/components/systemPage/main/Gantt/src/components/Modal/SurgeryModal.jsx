import React, { useEffect } from "react";
import "./SurgeryModal.css";

function SurgeryModal({ surgery, onClose, error }) {
  if (!surgery) return null;

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscKey);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  const formatDate = (dateValue) => {
    if (!dateValue) return '未指定';
    
    try {
      if (typeof dateValue === 'string') {
        return dateValue;
      } else {
        return new Date(dateValue).toLocaleDateString();
      }
    } catch (error) {
      console.error('日期格式化錯誤:', error);
      return '日期格式錯誤';
    }
  };

  const formatTime = (time) => {
    if (!time) return '未指定';
    
    try {
      const [hours, minutes] = time.split(":").map(Number);
      if (hours >= 24) {
        const adjustedHours = hours - 24;
        return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
      return time;
    } catch (error) {
      console.error('時間格式化錯誤:', error);
      return time;
    }
  };

  const getOperatingRoomName = () => {
    return surgery.operatingRoomName || '未指定';
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

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <p>顯示的可能是部分資料或舊資料</p>
          </div>
        )}

        {surgery.isPinned && (
          <div className="info-banner bg-red-50 border-l-4 border-red-500 p-3 mx-4 mt-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600 mr-2">
                <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
              </svg>
              <p className="text-sm text-red-700">此手術房已被釘選，手術排程無法移動</p>
            </div>
          </div>
        )}

        <div className="modal-body">
          <div className="info-group blue">
            <h3 className="text-blue-600">基本資訊</h3>
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
              <strong>手術日期：</strong> {formatDate(surgery.date)}
            </p>
          </div>

          <div className="info-group green">
            <h3>手術資訊</h3>
            <p>
              <strong>科別：</strong> {surgery.departmentName || '未指定'}
            </p>
            <p>
              <strong>手術名稱：</strong> {surgery.surgeryName || '未指定'}
            </p>
            <p>
              <strong>主刀醫師：</strong> {surgery.chiefSurgeonName || surgery.doctor || '未指定'}
            </p>
            <p>
              <strong>手術室：</strong> {getOperatingRoomName()}
            </p>
            <p>
              <strong>預估時間：</strong> {surgery.estimatedSurgeryTime || surgery.duration || '未指定'} {(surgery.estimatedSurgeryTime || surgery.duration) ? '分鐘' : ''}
            </p>
            {surgery.startTime && (
              <p>
                <strong>開始時間：</strong> {formatTime(surgery.startTime)}
              </p>
            )}
            {surgery.endTime && (
              <p>
                <strong>結束時間：</strong> {formatTime(surgery.endTime)}
              </p>
            )}
            <p>
              <strong>麻醉方式：</strong> {surgery.anesthesiaMethod || '未指定'}
            </p>
            <p>
              <strong>手術原因：</strong> {surgery.surgeryReason || '未指定'}
            </p>
          </div>
          <div className="info-group pink">
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
