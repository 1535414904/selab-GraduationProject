/* eslint-disable react/prop-types */
import { BASE_URL } from "../../../../../config";
import { faPenSquare, faPerson } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import EditableRow from "./EditableRow";
import axios from "axios";

function DepartmentListWrapper({
  departments,
  setDepartments,
  filterDepartment,
  deleteMode,
  selectedDepartments,
  setSelectedDepartments,
  setIdforChiefSurgeons,
}) {
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const tbodyRef = useRef(null);
  const theadRef = useRef(null);

  useEffect(() => {
    if (!departments.length) return;

    const newFilteredDepartments = departments.filter((department) => {
      const matchesId = filterDepartment.id
        ? department.id
          .toLowerCase()
          .includes(filterDepartment.id.toLowerCase())
        : true;
      const matchesName = filterDepartment.name
        ? department.name
          .toLowerCase()
          .includes(filterDepartment.name.toLowerCase())
        : true;

      return matchesId && matchesName;
    });

    const sortedDepartments = newFilteredDepartments.sort(
      (a, b) => b.role - a.role
    );

    setFilteredDepartments(sortedDepartments);
  }, [departments, filterDepartment.id, filterDepartment.name]);

  useEffect(() => {
    const adjustTheadWidth = () => {
      if (tbodyRef.current.scrollHeight > window.innerHeight * 0.6) {
        theadRef.current.style.width = "calc(100% - 17px)";
      } else {
        theadRef.current.style.width = "100%";
      }
    };

    if (tbodyRef.current) {
      adjustTheadWidth();
      tbodyRef.current.addEventListener("scroll", adjustTheadWidth);
    }

    return () => {
      if (tbodyRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        tbodyRef.current.removeEventListener("scroll", adjustTheadWidth);
      }
    };
  }, [filteredDepartments]);

  const handleEdit = (department) => {
    setEditingDepartment(department);
  };

  const handleSave = async (updatedDeparment) => {
    try {
      await axios.put(
        `${BASE_URL}/api/system/department/${updatedDeparment.id}`,
        updatedDeparment
      );
      const response = await axios.get(`${BASE_URL}/api/system/departments`);
      setDepartments(response.data);
      setEditingDepartment(null);
    } catch (error) {
      console.error("updated error：", error);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((department) => department !== id)
        : [...prevSelected, id]
    );
  };

  return (
    <div className="mgr-list">
      <table className="system-table">
        <thead ref={theadRef}>
          <tr>
            <th>科別編號</th>
            <th>科別名稱</th>
            <th>醫師人數</th>
            <th>動作</th>
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map((department) => (
              editingDepartment?.id === department.id ? (
                <EditableRow
                  key={department.id}
                  department={department}
                  handleSave={handleSave}
                />
              ) : (
                <tr key={department.id}>
                  <td>{department.id}</td>
                  <td>{department.name}</td>
                  <td>{department.chiefSurgeonsCount}</td>
                  <td>
                    {deleteMode ? (
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(department.id)}
                        onChange={() => handleCheckboxChange(department.id)}
                      />
                    ) : (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(department)}
                          className="edit-button"
                          title="編輯科別"
                        >
                          <FontAwesomeIcon icon={faPenSquare} size="lg" />
                        </button>
                        <button
                          onClick={() => setIdforChiefSurgeons(department.id)}
                          className="view-button"
                          title="查看醫師"
                        >
                          <FontAwesomeIcon icon={faPerson} size="lg" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                className="py-4 px-4 text-center text-gray-500 italic"
              >
                無符合條件的資料
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentListWrapper;
