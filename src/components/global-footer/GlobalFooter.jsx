import React from 'react';
import { Link } from 'react-router-dom';

const FooterLink = ({ to, label }) => (
  <Link
    to={to}
    className="block text-slate-700 hover:text-brand transition-colors duration-300"
  >
    {label}
  </Link>
);

const GlobalFooter = () => {
  return (
    <footer className="bg-slate-50 text-slate-700 mt-6">
      <div className="container mx-auto px-6 py-6">
        <div className="text-center mt-10">
          <p>
            &copy; {new Date().getFullYear()} StayFinder. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
