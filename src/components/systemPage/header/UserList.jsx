/* eslint-disable react/prop-types */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";

function UserList({fullTogglePage, name, toggleMainPage}) {
    const [isListOpen, setListOpen] = useState(false);

    const toggleMenu = () => {
        setListOpen(!isListOpen);
    };

    return (
        <div className="user-wrapper">
            <div className={`user ${isListOpen ? "show" : ""}`} onClick={toggleMenu}>
                <FontAwesomeIcon icon={faUser} />
                <span className="user-name">{name}</span>
            </div>

            <div className={`user-list ${isListOpen ? "show" : ""}`}>
                <button onClick={() => {toggleMainPage("userProfile");
                    setListOpen(false);
                }}>個人資料</button>
                <button onClick={() => fullTogglePage("loginPage")}>登出</button>
            </div>
        </div>
    );
}

export default UserList;
