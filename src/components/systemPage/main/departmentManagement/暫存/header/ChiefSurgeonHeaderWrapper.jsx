import axios from "axios";
import { BASE_URL } from "../../../../../../config";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

/* eslint-disable react/prop-types */
function ChiefSurgeonHeaderWrapper({ setChiefSurgeon,
    pageState, toggleState,
    filterChiefSurgeon, setFilterChiefSurgeon,
    deleteMode, setDeleteMode,
    selectChiefSurgeons, setSelectChiefSurgeons,
    addHandleSubmit,
    departmentId, setDepartmentId,
    setEmptyError}) {

    const handleChange = (e) => {
        setFilterChiefSurgeon(prevState => ({
            ...prevState,
            [e.value.name]: e.target.value
        }));
    };

    useEffect (() => {
        console.log("選擇的醫生：",selectChiefSurgeons);
    },[selectChiefSurgeons])

    const handleDelete = async () => {
        if(selectChiefSurgeons.length === 0) {
            alert("請選擇要刪除的帳戶");
            return;
        }
        try {
            await axios.delete(`${BASE_URL}/api/system/chief-surgeons/delete`, {
                data: selectChiefSurgeons
            });
            const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
            setChiefSurgeon(response.data);
            setSelectChiefSurgeons([]);
            setDeleteMode(false);
        } catch (error) {
            console.log("ChiefSurgeon delete error: ", error)
        }
    }

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
                    <FontAwesomeIcon className="filter" icon={faMagnifyingGlass} />

                    <input
                        type="text"
                        name="id"
                        placeholder="請輸入員工編號"
                        value={filterChiefSurgeon.id}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="name"
                        placeholder="請輸入醫師名稱"
                        value={filterChiefSurgeon.name}
                        onChange={handleChange}
                    />
                    {!deleteMode && <button className="account-button chief-surgeon-right-button" onClick={() => setDepartmentId("")}>返回</button>}
                    {!deleteMode && <button className="account-button" onClick={() => toggleState("add")}>新增</button>}

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
            )
            }
        </div >
    )
}

export default ChiefSurgeonHeaderWrapper;