import React from 'react';

class DropdownMenu extends React.Component {
  render() {
    const menuItems = this.props.menuItems;
    return (
      <div className="dropdown-menu">
        {menuItems.map(el => {
            if (el.title) return <div className="menu-title" onClick={el.func}>{el.title}</div>;
            else return <div className={el} />
          }
        )}
      </div>
    );
  }
}

export default DropdownMenu;