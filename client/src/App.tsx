import AppShell from './components/AppShell';
import Header from './components/Header';
import Sidebar from './components/Sidebar/Sidebar';
import InfiniteCanvas from './components/Canvas/InfiniteCanvas';
import Toolbar from './components/Toolbar/Toolbar';
import ZoomModal from './components/ZoomModal';

function App() {
  return (
    <AppShell>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <InfiniteCanvas />
        </div>
        <Toolbar />
      </div>
      <ZoomModal />
    </AppShell>
  );
}

export default App;
