import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Habilidades from './pages/Habilidades';
import Perfil from './pages/Perfil';

function App() {
  return (
    <div className="container">
      <Header />
      <main className="card">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/habilidades" element={<Habilidades />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
