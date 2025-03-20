import { useEffect, useState, useRef } from "react";
import Select from "react-select";

function DepartmentFilter({ departments, filterDepartment, setFilterDepartment }) {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);

  const handleChange = (e) => {
    setFilterDepartment(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  // 清除所有篩選條件
  const clearFilters = () => {
    setFilterDepartment({ id: "", name: "" });
  };

  // 檢查是否有任何篩選條件
  const hasFilters = filterDepartment.id !== "" || filterDepartment.name !== "";

  const handleNameChange = (selectedOption) => {
    setFilterDepartment((prevState) => ({
      ...prevState,
      name: selectedOption ? selectedOption.label : "",
    }));
  };

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
            placeholder="請輸入科別編號..."
            value={filterDepartment.id}
            onChange={handleChange}
          />
        </div>
        <div className="filter-content">
          <Select
            className="filter-select"
            options={departments.map((department) => ({
              value: department.name,
              label: department.name
            }))}
            value={departments.find((department) => department.name === filterDepartment.name)
              ? { value: filterDepartment.name, label: filterDepartment.name }
              : null}
            onChange={handleNameChange}
            placeholder="請選擇科別名稱..."
            isClearable={true}
          />
        </div>
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
      </div>
      <button className="filter-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        篩選
      </button>
    </div>
  );
}

export default DepartmentFilter;
