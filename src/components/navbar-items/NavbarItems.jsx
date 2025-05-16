import { Link, useNavigate, useLocation } from 'react-router-dom';
import DropdownButton from 'components/ux/dropdown-button/DropdownButton';
import { networkAdapter } from 'services/NetworkAdapter';
import { useContext } from 'react';
import { AuthContext } from 'contexts/AuthContext';

/**
 * A component that renders the navigation items for the navbar for both mobile/desktop view.
 *
 * @param {Object} props - The component's props.
 * @param {boolean} props.isAuthenticated - A flag indicating whether the user is authenticated.
 * @param {Function} props.onHamburgerMenuToggle
 */
const NavbarItems = ({ isAuthenticated, onHamburgerMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(AuthContext);

  /**
   * Handles the logout action by calling the logout API and updating the authentication state.
   */
  const handleLogout = async () => {
    await networkAdapter.post('api/users/logout');
    context.triggerAuthCheck();
    navigate('/login');
  };

  const dropdownOptions = [
    { name: 'Профиль', onClick: () => navigate('/user-profile') },
    { name: 'Выйти', onClick: handleLogout },
  ];

  /**
   * Determines if a given path is the current active path.
   *
   * @param {string} path - The path to check.
   * @returns {boolean} - True if the path is active, false otherwise.
   */
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <li className="p-4 hover:bg-blue-900 md:hover:bg-blue-600">
        <Link
          to="/"
          className={`uppercase font-medium text-slate-100 hover-underline-animation ${
            isActive('/') && 'active-link'
          }`}
          onClick={onHamburgerMenuToggle}
        >
          Главная
        </Link>
      </li>
      <li className="p-4 hover:bg-blue-900 md:hover:bg-blue-600">
        <Link
          to="/hotels"
          className={`uppercase font-medium text-slate-100 hover-underline-animation ${
            isActive('/hotels') && 'active-link'
          }`}
          onClick={onHamburgerMenuToggle}
        >
          Отели
        </Link>
      </li>
      <li
        className={`${!isAuthenticated && 'p-4 hover:bg-blue-900 md:hover:bg-blue-600'}`}
      >
        {isAuthenticated ? (
          <DropdownButton triggerType="click" options={dropdownOptions} />
        ) : (
          <Link
            to="/login"
            className={`uppercase font-medium text-slate-100 hover-underline-animation ${
              isActive('/login') && 'active-link'
            }`}
            onClick={onHamburgerMenuToggle}
          >
            Вход/Регистрация
          </Link>
        )}
      </li>
    </>
  );
};

export default NavbarItems;
