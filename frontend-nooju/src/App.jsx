import { RouterProvider } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';
import ScrollTop from 'components/ScrollTop';
import { AuthProvider } from 'contexts/AuthContext';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeCustomization>
        <ScrollTop>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ScrollTop>
      </ThemeCustomization>
    </DndProvider>
  );
}
