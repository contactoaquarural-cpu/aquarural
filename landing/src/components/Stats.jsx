const Stats = ({ stats }) => {
  const items = [
    { valor: stats?.totalAsociados || '—',  label: 'Asociados activos',    icon: '🧑‍🌾' },
    { valor: stats?.totalConvenios || '—',  label: 'Convenios disponibles', icon: '🤝' },
    { valor: stats?.totalNoticias  || '—',  label: 'Noticias publicadas',   icon: '📰' },
    { valor: '100%',                         label: 'Digital y seguro',      icon: '🔒' },
  ];

  return (
    <section className="bg-dark-card border-y border-dark-border py-14 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-3xl mb-1">{item.icon}</div>
            <div className="text-3xl font-extrabold text-primary">{item.valor}</div>
            <div className="text-sm text-gray-400 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
