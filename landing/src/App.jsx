import { ThemeProvider } from './utils/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SimuladorRecaudo from './components/SimuladorRecaudo';
import Modulos from './components/Modulos';
import PlanesSaaS from './components/PlanesSaaS';
import Contacto from './components/Contacto';
import Footer from './components/Footer';

const App = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-body selection:bg-cyan-500 selection:text-slate-950">
        <Navbar />
        <Hero />
        <SimuladorRecaudo />
        <Modulos />
        <PlanesSaaS />
        <Contacto />
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;
