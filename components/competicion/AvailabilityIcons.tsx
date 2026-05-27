import { Bandage } from "lucide-react";

type CardIconProps = {
  className?: string;
};

export function InjuryIcon({ className }: CardIconProps) {
  return <Bandage className={className} aria-hidden />;
}

export function YellowCardIcon({ className }: CardIconProps) {
  return (
    <svg viewBox="0 0 16 22" className={className} aria-hidden>
      <rect x="1" y="1" width="14" height="20" rx="2" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
    </svg>
  );
}

export function RedCardIcon({ className }: CardIconProps) {
  return (
    <svg viewBox="0 0 16 22" className={className} aria-hidden>
      <rect x="1" y="1" width="14" height="20" rx="2" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
    </svg>
  );
}
