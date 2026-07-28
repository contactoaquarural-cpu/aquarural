import { useEffect, useState } from 'react';
import { getConfiguracion, getNoticias, getConvenios, getPrecios } from './services/api';
import { ThemeProvider } from './utils/ThemeContext';
import Navbar    from './components/Navbar';
import Hero      from './components/Hero';
import Stats     from './components/Stats';
import Modulos   from './components/Modulos';
import Noticias  from './components/Noticias';
import Convenios from './components/Convenios';
import Precios   from './components/Precios';
import Contacto  from './components/Contacto';
import Footer    from './components/Footer';

const App = () => {
  const [config,    setConfig]    = useState(null);
  const [noticias,  setNoticias]  = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [precios,   setPrecios]   = useState([]);
  const [stats,     setStats]     = useState({});

  useEffect(() => {
    getConfiguracion().then((r) => setConfig(r.data.data)).catch(() => {});
    getNoticias().then((r)       => setNoticias(r.data.data ?? [])).catch(() => {});
    getConvenios().then((r)      => setConvenios(r.data.data ?? [])).catch(() => {});
    getPrecios().then((r)        => setPrecios(r.data.data ?? [])).catch(() => {});
  }, []);

  // Calcular stats simples desde los datos cargados
  useEffect(() => {
    setStats({
      totalConvenios: convenios.length,
      totalNoticias:  noticias.length,
    });
  }, [convenios, noticias]);

  // Actualizar título de la página con el nombre de la asociación
  useEffect(() => {
    if (config?.nombreAsociacion) {
      document.title = config.nombreAsociacion;
    }
  }, [config]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-dark">
        <Navbar    config={config} />
        <Hero      config={config} />
        <Stats     stats={stats} />
        <Modulos   />
        <Noticias  noticias={noticias} />
        <Convenios convenios={convenios} />
        <Precios   precios={precios} />
        <Contacto  config={config} />
        <Footer    config={config} />
      </div>
    </ThemeProvider>
  );
};

export default App;
