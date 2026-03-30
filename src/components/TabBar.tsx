import { TabKey } from '@/types/order';

interface Tab {
  key: TabKey;
  label: string;
  count?: number;
  urgent?: boolean;
}

interface TabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  tabs: Tab[];
}

const TabBar = ({ activeTab, onTabChange, tabs }: TabBarProps) => {
  return (
    <div className="bg-card border-b border-border2 overflow-x-auto">
      <div className="flex min-w-max">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2.5 text-floor font-bold whitespace-nowrap relative transition-colors ${
              activeTab === tab.key
                ? 'text-foreground border-b-2 border-accent'
                : 'text-dim border-b-2 border-transparent'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[12px] font-bold ${
                  tab.urgent
                    ? 'bg-danger text-danger-foreground'
                    : 'bg-raised text-mid'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabBar;
