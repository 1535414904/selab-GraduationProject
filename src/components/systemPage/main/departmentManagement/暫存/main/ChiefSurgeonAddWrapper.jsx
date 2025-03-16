/* eslint-disable react/prop-types */
function ChiefSurgeonAddWrapper({ chiefSurgeons, setChiefSurgeons, emptyError }) {
    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const updatedChiefSurgeons = [...chiefSurgeons];
        updatedChiefSurgeons[index][name] = value;
        setChiefSurgeons(updatedChiefSurgeons);
    };

    const addRow = () => {
        setChiefSurgeons([...chiefSurgeons, { id: "", name: "" }]);
    };

    const removeRow = () => {
        if (chiefSurgeons.legth > 1) {
            setChiefSurgeons(chiefSurgeons.slice(0, -1));
        }
    };

    return (
        <div className="mgr-list">
            <table className="system-table">
                <thead>
                    <tr>
                        <th>員工編號</th>
                        <th>醫師名稱</th>
                    </tr>
                </thead>

                <tbody>
                    {chiefSurgeons.map((chiefSurgeon, index) => (
                        <tr className="editable-row" key={index}>
                            <td>
                                <input
                                    type="text"
                                    name="id"
                                    value={chiefSurgeon.id}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="輸入員工編號"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="name"
                                    value={chiefSurgeon.name}
                                    onChange={(e) => handleChange(index, e)}
                                    placeholder="輸入醫師編號"
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

export default ChiefSurgeonAddWrapper;