import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Modulos from './components/Modulos';
import PlanesSaaS from './components/PlanesSaaS';
import Contacto from './components/Contacto';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-body selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />
      <Hero />
      <Modulos />
      <PlanesSaaS />
      <Contacto />
      <Footer />
    </div>
  );
};

export default App;
