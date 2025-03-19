import { useState, useEffect, useRef, useMemo } from "react";

function ORFilter({ operatingRooms, filterOperatingRoom, setFilterOperatingRoom }) {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);

  const handleChange = (e) => {
    setFilterOperatingRoom(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  // 清除所有篩選條件
  const clearFilters = () => {
    setFilterOperatingRoom({ id: "", name: "", department: "", roomType: "", status: "" });
  };

  const hasFilters =
    filterOperatingRoom.id !== "" ||
    filterOperatingRoom.name !== "" ||
    filterOperatingRoom.department !== "" ||
    filterOperatingRoom.roomType !== "" ||
    filterOperatingRoom.status !== "";

  // 從現有資料中取得唯一的科別選項
  const departmentOptions = useMemo(() => {
    const setOptions = new Set();
    operatingRooms.forEach(or => {
      if (or.department && or.department.name) {
        setOptions.add(or.department.name);
      }
    });
    return Array.from(setOptions);
  }, [operatingRooms]);

  // 從現有資料中取得唯一的手術房種類選項
  const roomTypeOptions = useMemo(() => {
    const setOptions = new Set();
    operatingRooms.forEach(or => {
      if (or.roomType) {
        setOptions.add(or.roomType);
      }
    });
    return Array.from(setOptions);
  }, [operatingRooms]);

  // 從現有資料中取得唯一的狀態選項（以字串呈現）
  const statusOptions = useMemo(() => {
    const setOptions = new Set();
    operatingRooms.forEach(or => {
      if (or.status !== undefined && or.status !== null) {
        setOptions.add(or.status.toString());
      }
    });
    return Array.from(setOptions);
  }, [operatingRooms]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={filterRef}
      className={`filter-panel-container ${isOpen ? "filter-panel-open" : "filter-panel-closed"}`}
    >
      <div className="filter-panel">
        <div className="filter-header">
          <h3 className="filter-title">篩選條件</h3>
          <button onClick={() => setIsOpen(false)} className="filter-close-btn">
            ✕
          </button>
        </div>
        <div className="filter-content">
          <input
            type="text"
            name="id"
            className="filter-input"
            placeholder="請輸入房間編號..."
            value={filterOperatingRoom.id}
            onChange={handleChange}
          />
        </div>
        <div className="filter-content">
          <input
            type="text"
            name="name"
            className="filter-input"
            placeholder="請輸入房間名稱..."
            value={filterOperatingRoom.name}
            onChange={handleChange}
          />
        </div>
        <div className="filter-content">
          <select
            name="department"
            className="filter-input"
            value={filterOperatingRoom.department}
            onChange={handleChange}
          >
            <option value="">全部科別</option>
            {departmentOptions.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
        <div className="filter-content">
          <select
            name="roomType"
            className="filter-input"
            value={filterOperatingRoom.roomType}
            onChange={handleChange}
          >
            <option value="">全部手術房種類</option>
            {roomTypeOptions.map(rt => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>
        </div>
        <div className="filter-content">
          <select
            name="status"
            className="filter-input"
            value={filterOperatingRoom.status}
            onChange={handleChange}
          >
            <option value="">全部狀態</option>
            {statusOptions.map(st => (
              <option key={st} value={st}>
                {st === "1" ? "開啟" : st === "0" ? "關閉" : st}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <div className="filter-content">
            <button
              onClick={clearFilters}
              className="clear-filters-btn"
              style={{
                backgroundColor: "#3498db",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "12px",
                fontWeight: "500",
                width: "100%",
              }}
            >
              清除所有篩選條件
            </button>
          </div>
        )}
      </div>
      <button className="filter-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        篩選
      </button>
    </div>
  );
}

export default ORFilter;
