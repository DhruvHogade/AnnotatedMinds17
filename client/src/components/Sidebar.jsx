import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Library, BookOpen, PenLine, Layers, Quote, Search, Settings, FileText, PlusCircle } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const renderNavLink = (name, path, icon, isActiveCondition) => {
    const isActive = isActiveCondition ? isActiveCondition(location.pathname) : location.pathname === path;
    return (
      <NavLink
        to={path}
        className={`flex items-center gap-3 px-6 py-2 text-[13px] font-medium transition-colors ${
          isActive
            ? 'bg-accentTaupe text-maroon border-l-4 border-maroon'
            : 'text-textDark hover:bg-black/5 border-l-4 border-transparent'
        }`}
      >
        <span className={`${isActive ? 'text-maroon' : 'text-textGray'}`}>{icon}</span>
        {name}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-sidebarBg h-screen sticky top-0 flex flex-col flex-shrink-0 z-50 overflow-y-auto custom-scrollbar border-r border-black/5">
      
      {/* Top Window Controls */}
      <div className="px-4 py-4 flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          {renderNavLink('Dashboard', '/', <LayoutDashboard size={16} />)}
        </div>

        <div className="space-y-6 flex-1">
          {/* READING HUB Section */}
          <div>
            <div className="px-6 py-2 mb-2 mx-2 bg-accentTaupe/70 rounded-md">
              <span className="text-maroon font-semibold uppercase tracking-wider text-[11px]">READING HUB</span>
            </div>
            <nav className="space-y-[2px]">
              {renderNavLink('Personal Library', '/library', <Library size={16} />)}
              {renderNavLink('Reading Strategy', '/goals', <PenLine size={16} />)}
              {renderNavLink('Book Reviews', '/reviews', <FileText size={16} />)}
            </nav>
          </div>

          {/* Series & Quotes */}
          <div>
            <div className="px-6 py-2 mb-2 mx-2 bg-accentTaupe/30 rounded-md">
              <span className="text-maroon/60 font-semibold uppercase tracking-wider text-[11px]">COLLECTIONS</span>
            </div>
            <nav className="space-y-[2px]">
              {renderNavLink('Series Tracker', '/series', <Layers size={16} />)}
              {renderNavLink('Quotes Archive', '/quotes', <Quote size={16} />)}
            </nav>
          </div>
        </div>

        {/* Bottom Nav */}
        <nav className="mt-auto pb-8 pt-4 border-t border-black/5">
          {renderNavLink('Settings', '/settings', <Settings size={16} />)}
        </nav>
      </div>
    </aside>
  );
}
