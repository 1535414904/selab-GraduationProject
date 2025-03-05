import axios from "axios";
import { BASE_URL } from "../../../../../config";

/* eslint-disable react/prop-types */
function ORHeaderWrapper({ operatingRooms, setOperatingRooms,
    pageState, toggleState,
    filterOperatingRoom, setFilterOperatingRoom, 
    deleteMode, setDeleteMode,
    selectedOperatingRooms, setSelectedOperatingRooms,
    addHandleSubmit, setEmptyError }) {

    const handleChange = (e) => {
        setFilterOperatingRoom(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const handleDelete = async () => {
        if (selectedOperatingRooms.length === 0) {
            alert("請選擇要刪除的帳戶");
            return;
        }
        try {
            await axios.delete(`${BASE_URL}/api/system/operating-rooms/delete`, {
                data: selectedOperatingRooms
            });
            setOperatingRooms(operatingRooms.filter(operatingRoom => !selectedOperatingRooms.includes(operatingRoom.id)));
            setSelectedOperatingRooms([]);
            setDeleteMode(false);
        } catch (error) {
            console.error("刪除失敗：", error);
        }
    };

    const handleBack = () => {
        toggleState("list");
        setEmptyError(null);
    }

    return (
        <div className="header-wrapper">
            <div className="title">
                <h1>科別管理</h1>
            </div>

            {pageState === "list" && (
                <div className="header-function">
                    <div className="filter">篩選</div>

                    <input
                        type="text"
                        name="id"
                        placeholder="請輸入科別編號"
                        value={filterOperatingRoom.id}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="name"
                        placeholder="請輸入科別名稱"
                        value={filterOperatingRoom.name}
                        onChange={handleChange}
                    />

                    {!deleteMode && <button className="account-button department-right-button" onClick={() => toggleState("add")}>新增</button>}
                
                    {!deleteMode ? (
                        <button className="account-button mgr-cancel" onClick={() => setDeleteMode(true)}>刪除</button>
                    ) : (
                        <div>
                            <button className="account-button department-right-button" onClick={handleDelete}>確認</button>
                            <button className="account-button mgr-cancel" onClick={() => setDeleteMode(false)}>取消</button>
                        </div>
                    )}
                </div>
            )}

            {pageState === "add" && (
                <div>
                    <button className="account-button" onClick={addHandleSubmit}>確認</button>
                    <button className="account-button mgr-cancel" onClick={handleBack}>返回</button>
                </div>
            )}
        </div>
    )
}

export default ORHeaderWrapper;