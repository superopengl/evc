
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = () =>
  <Link to="/">
    <div style={{
      marginLeft: 'auto',
      marginRight:'auto',
      backgroundImage: `url('/android-chrome-192x192.png')`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      width: 80,
      height: 80,
      borderRadius: 4,
      cursor: 'pointer',
    }}></div>
  </Link>