import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PromotionDatesProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

const PromotionDates = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: PromotionDatesProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="startDate">Start Date</Label>
      <Input
        type="date"
        id="startDate"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="endDate">End Date</Label>
      <Input
        type="date"
        id="endDate"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        required
      />
    </div>
  </div>
);

export default PromotionDates;