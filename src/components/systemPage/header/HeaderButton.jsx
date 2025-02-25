/* eslint-disable react/prop-types */
function HeaderButton({label, onClick}) {
    return <button className="header-button" onClick={onClick}>{label}</button>
}

export default HeaderButton;