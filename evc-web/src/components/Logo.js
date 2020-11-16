
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = () =>
  <Link to="/">
    <img alt="EasyValueCheck logo" src="/images/header-logo.png" width="auto" height="40" style={{ padding: '2px 0 2px 0' }}></img>
  </Link>