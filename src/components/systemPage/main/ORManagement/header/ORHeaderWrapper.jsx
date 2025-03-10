import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

/* eslint-disable react/prop-types */
function ORHeaderWrapper({
    operatingRooms, setOperatingRooms,
    filterOperatingRoom, setFilterOperatingRoom,
    selectedOperatingRooms, setSelectedOperatingRooms,
    setEmptyError, handleDelete,
    addOperatingRooms, setAddOperatingRooms }) {

    const handleChange = (e) => {
        setFilterOperatingRoom(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const addRow = () => {
        setAddOperatingRooms([...addOperatingRooms,
        { id: "", name: "", departmentId: "1", roomType: "", status: 1 }]);
    };

    return (
        <div className="header-wrapper">
            <div className="title">
                <h1>手術房管理</h1>
            </div>

            <div className="header-function">
                <FontAwesomeIcon className="filter" icon={faMagnifyingGlass} />

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

                <button className="account-button department-right-button" onClick={addRow}>新增</button>
                <button className="account-button mgr-cancel" onClick={() => handleDelete(selectedOperatingRooms)}>刪除</button>
            </div>
        </div>
    )
}

export default ORHeaderWrapper;