import React from 'react';
import { ReactSVG } from 'react-svg';

const menuItems = [
  { title: 'File', items: [
    { title: 'New' },
    { title: 'Open' },
    'separator',
    { title: 'Export' }
  ]},
]

class DropdownMenu extends React.Component {
  render() {
    return (
      <div className="dropdown-menu">
        {menuItems.map(el => (
          <div className="menu-title">{el.title}</div>
        ))}
      </div>
    );
  }
}

export default DropdownMenu;