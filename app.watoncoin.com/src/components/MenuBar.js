import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const MenuWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #1f2937;
  padding: 10px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const MenuItem = styled(NavLink)`
  color: #e5e7eb;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;

  &.active {
    color: #3b82f6;
    font-weight: bold;
  }

  &:hover {
    color: #3b82f6;
  }
`;

const MenuBar = () => {
  return (
    <MenuWrapper>
      <MenuItem to="/" end>
        🏠 Home
      </MenuItem>
      <MenuItem to="/tasks">📝 Tasks</MenuItem>
      <MenuItem to="/stats">📊 Stats</MenuItem>
      <MenuItem to="/frens">👥 Frens</MenuItem>
      <MenuItem to="/premium">💎 Premium</MenuItem>
    </MenuWrapper>
  );
};

export default MenuBar;
