import { Button } from "../ui/button";

interface ConfirmationCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onEdit?: () => void;
}

export const ConfirmationCard = ({ title, icon, children, onEdit }: ConfirmationCardProps) => {
  return (
    <div className="p-6 rounded-lg border border-gray-200 flex flex-col items-start justify-between">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
      </div>
      <div className="space-y-1 mb-4">
        {children}
      </div>
      </div>
      <Button variant="ghost" className="text-[#00A862] hover:text-[#008F53] hover:bg-transparent p-0 text-base font-medium transition-colors" onClick={onEdit}>Endre</Button>
    </div>
  );
};
