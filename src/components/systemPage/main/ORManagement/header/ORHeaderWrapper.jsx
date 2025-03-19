import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import ORFilter from "../ORFilter";

/* eslint-disable react/prop-types */
function ORHeaderWrapper({
  operatingRooms, setOperatingRooms,
  filterOperatingRoom, setFilterOperatingRoom,
  selectedOperatingRooms, setSelectedOperatingRooms,
  setEmptyError, handleDelete,
  addOperatingRooms, setAddOperatingRooms
}) {
  const addRow = () => {
    setAddOperatingRooms([...addOperatingRooms, { id: "", name: "", department: "", roomType: "", status: 1 }]);
  };

  return (
    <div className="header-wrapper">
      <div className="title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 mr-2"
          style={{ width: "1em", height: "1em" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
        <h1>手術房管理</h1>
      </div>
      <div className="header-function">
        <ORFilter
          operatingRooms={operatingRooms}
          filterOperatingRoom={filterOperatingRoom}
          setFilterOperatingRoom={setFilterOperatingRoom}
        />
        <button className="account-button department-right-button" onClick={addRow}>
          新增
        </button>
        <button className="account-button mgr-cancel" onClick={() => handleDelete(selectedOperatingRooms)}>
          刪除
        </button>
      </div>
    </div>
  );
}

export default ORHeaderWrapper;
