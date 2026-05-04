import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const BloodDropIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-7 h-7 text-red-500"
  >
    <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Find Donors", href: "/find-donors" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <BloodDropIcon />
            <span className="text-white font-bold text-xl tracking-tight">
              Blood<span className="text-red-500">Compass</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {user &&
              navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative flex items-center gap-4">
                <div
                  className="relative"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <button className="text-gray-400 text-sm hover:text-white transition-colors duration-200">
                    {user.name} ▾
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 pt-2 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/update-profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        Update Profile
                      </Link>
                      <hr className="border-gray-700 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg"
          >
            {isOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-4 space-y-3">
          {user &&
            navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-gray-300 hover:text-white text-sm font-medium py-2 transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}

          <div className="pt-3 border-t border-gray-800">
            {user ? (
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">{user.name}</p>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-white text-sm font-medium py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg text-center transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
