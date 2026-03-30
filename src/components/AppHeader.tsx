const AppHeader = () => {
  return (
    <header className="bg-card border-b border-border2 px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-accent flex items-center justify-center">
          <span className="text-accent-foreground font-bold text-floor">VV</span>
        </div>
        <span className="font-bold text-floor text-foreground">VitalVida Telesales</span>
      </div>
      <div className="text-right">
        <div className="text-floor font-semibold text-foreground">Emeka Okafor</div>
        <div className="font-mono text-floor text-accent">74% · this month</div>
      </div>
    </header>
  );
};

export default AppHeader;
