"use client";
import React, { useState, useEffect } from 'react';
import { User, BarChart3, TrendingUp, TrendingDown, LogOut, Menu, X } from 'lucide-react';
import DashboardLayout from '../screens/DashboardLayout';
import IncomeLayout from '../screens/IncomeLayout';
import ExpenseLayout from '../screens/ExpenseLayout'; 

const Dashboard = () => {
  return (
    <div className="p-4 md:p-8">
        <DashboardLayout/>
      </div>
  );
};

const Income = () => {
  return (
    <div className="p-4 md:p-8">
        <IncomeLayout/>
    </div>
  );
};

const Expense = () => {
  return (
    <div className="p-4 md:p-8">
        <ExpenseLayout/>
    </div>
  );
};

function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'income':
        return <Income />;
      case 'expense':
        return <Expense />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    alert('Logging out...');
    // Add logout logic here
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    // Close sidebar on mobile after navigation
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isSidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.hamburger-btn')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-40 h-16 flex items-center justify-between px-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hamburger-btn p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          {activeSection}
        </h2>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}

      {/* Sidebar */}
      <div className={`
        sidebar fixed h-screen lg:static lg:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-300 ease-in-out
        w-64 h-full bg-white shadow-lg z-50 lg:z-auto
        flex flex-col
      `}>
        {/* Profile Section */}
        <div className="p-4 md:p-6 border-b border-gray-200 mt-16 lg:mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate">John Doe</h3>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 md:p-4 flex-1">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center space-x-3 px-3 md:px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'dashboard'
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('income')}
                className={`w-full flex items-center space-x-3 px-3 md:px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'income'
                    ? 'bg-green-100 text-green-700 border-r-4 border-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Income</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('expense')}
                className={`w-full flex items-center space-x-3 px-3 md:px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === 'expense'
                    ? 'bg-red-100 text-red-700 border-r-4 border-red-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingDown className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Expense</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-3 md:p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 md:px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        {renderContent()}
      </div>
    </div>
  );
}

export default Home;