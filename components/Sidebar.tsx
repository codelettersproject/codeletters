import React, { memo } from 'react';

import Logo from './Logo';


const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar__logo">
        <Logo />
      </div>
    </div>
  );
};

export default memo(Sidebar);
