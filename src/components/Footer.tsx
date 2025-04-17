
import React from 'react';

const APP_VERSION = '1.0.4'; // Updated version number

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-muted/50 p-2 text-center text-sm text-muted-foreground">
      <div className="container mx-auto">
        Version {APP_VERSION} © {new Date().getFullYear()} Removal Company Dashboard
      </div>
    </footer>
  );
};

export default Footer;
