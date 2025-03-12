function SurgeryDetail({ selectedSurgeryIdm, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>手術詳細資訊</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    
                </div>
            </div>
        </div>
    )
}

export default SurgeryDetail;