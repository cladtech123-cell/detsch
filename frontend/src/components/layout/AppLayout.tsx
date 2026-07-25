import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/** App shell: sidebar + header + main content area in DeutschMastery layout. */
export function AppLayout() {
  return (
    <div
      className="flex min-h-screen font-body-md antialiased overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: 'var(--dm-background)', color: 'var(--dm-on-surface)' }}
    >
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-10 pt-0 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
