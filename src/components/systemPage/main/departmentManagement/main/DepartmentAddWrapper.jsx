/* eslint-disable react/prop-types */
function DepartmentAddWrapper ({ departments, setDepartments, emptyError }) {
    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const updatedDepartments = [...departments];
        updatedDepartments[index][name] = value;
        setDepartments(updatedDepartments);
    };

    const addRow = () => {
        setDepartments([...departments, { id: "", name: "" }]);
    };

    const removeRow = () => {
        if(departments.legth > 1) {
            setDepartments(departments.slice(0, -1));
        }
    };

    return (
        <div className="mgr-list">
            <table className="system-table">
                <thead>
                    <tr>
                        <th>科別編號</th>
                        <th>科別名稱</th>
                    </tr>
                </thead>

                <tbody>
                    {departments.map((department, index) => (
                        <tr className="editable-row" key={index}>
                            <td>
                                <input 
                                    type="text"
                                    name="id"
                                    value={department.id}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="輸入科別編號"
                                />
                            </td>
                            <td>
                                <input 
                                    type="text"
                                    name="name"
                                    value={department.name}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="輸入科別名稱"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p className="error">{emptyError}</p>

            <div>
                <button className="row-button" onClick={addRow}>➕</button>
                <button className="row-button" onClick={removeRow}>➖</button>
            </div>
        </div>
    )
}

export default DepartmentAddWrapper;