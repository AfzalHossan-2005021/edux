import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LogoImage from '../public/T_logo.png';

const Logo = () => {
  return (
    <Link href='/'>
      <Image src={LogoImage} alt='Logo' height='50' priority={true} />
    </Link>
  );
};

export default Logo;
