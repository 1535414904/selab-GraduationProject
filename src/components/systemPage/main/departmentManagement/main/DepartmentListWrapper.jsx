/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare, faPlus, faTrash, faUsers } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import EditableRow from "./EditableRow";
import AddRow from "./AddRow";
import ChiefSurgeonListWrapper from "../chiefSurgeonManagement/ChiefSurgeonListWrapper";

function DepartmentListWrapper({
  departments,
  setDepartments,
  filterDepartment,
  selectedDepartments,
  setSelectedDepartments,
  handleDelete,
  addDepartments,
  setAddDepartments,
  handleAdd,
  emptyError,
}) {
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [addChiefSurgeons, setAddChiefSurgeons] = useState([]);

  useEffect(() => {
    if (!departments.length) return;

    const newFilteredDepartments = departments.filter((department) => {
      const matchesId = filterDepartment.id
        ? department.id.toLowerCase().includes(filterDepartment.id.toLowerCase())
        : true;
      const matchesName = filterDepartment.name
        ? department.name.toLowerCase().includes(filterDepartment.name.toLowerCase())
        : true;
      return matchesId && matchesName;
    });

    setFilteredDepartments(newFilteredDepartments.sort((a, b) => b.role - a.role));
  }, [departments, filterDepartment.id, filterDepartment.name]);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
  };

  const handleSave = async (updatedDepartment) => {
    try {
      await axios.put(`${BASE_URL}/api/system/department/${updatedDepartment.id}`, updatedDepartment);
      const response = await axios.get(`${BASE_URL}/api/system/departments`);
      setDepartments(response.data);
      setEditingDepartment(null);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((department) => department !== id)
        : [...prevSelected, id]
    );
  };

  const addRow = () => {
    setAddChiefSurgeons([...addChiefSurgeons, { id: "", name: "" }])
  }

  return (
    <div className="mgr-list">
      <table className="system-table">
        <thead>
          <tr>
            <th></th>
            <th>科別編號</th>
            <th>科別名稱</th>
            <th>醫師人數</th>
            <th>動作</th>
          </tr>
        </thead>
        <tbody>
          <AddRow
            addDepartments={addDepartments}
            setAddDepartments={setAddDepartments}
            handleAdd={handleAdd}
            emptyError={emptyError}
          />
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map((department, index) => (
              editingDepartment?.id === department.id ? (
                <EditableRow key={department.id} department={department} handleSave={handleSave} />
              ) : (
                <>
                  <tr key={department.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(department.id)}
                        onChange={() => handleCheckboxChange(department.id)}
                      />
                    </td>
                    <td>{department.id}</td>
                    <td>{department.name}</td>
                    <td>{department.chiefSurgeonsCount}</td>
                    <td>
                      <div className="action-buttons">
                        <FontAwesomeIcon className="edit-button" icon={faPenSquare} onClick={() => handleEdit(department)} />
                        <FontAwesomeIcon className="delete-button" icon={faTrash} onClick={() => handleDelete(department.id)} />
                        <FontAwesomeIcon className="view-button" icon={faUsers} onClick={() => {
                          toggleRow(index);
                          setAddChiefSurgeons([]);
                        }} />
                        {expandedRow === index && <FontAwesomeIcon className="add-button" icon={faPlus} onClick={addRow} />}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === index &&
                    <ChiefSurgeonListWrapper
                      departmentId={department.id}
                      addChiefSurgeons={addChiefSurgeons}
                      setAddChiefSurgeons={setAddChiefSurgeons}
                      setDepartments={setDepartments}
                    />}
                </>
              )
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-4 px-4 text-center text-gray-500 italic">
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
