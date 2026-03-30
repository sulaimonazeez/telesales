interface StepDotsProps {
  label: string;
  total: number;
  filled: number;
}

const StepDots = ({ label, total, filled }: StepDotsProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-floor text-mid">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < filled ? 'bg-accent' : 'bg-border2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default StepDots;
