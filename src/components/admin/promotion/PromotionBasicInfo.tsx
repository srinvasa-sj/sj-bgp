import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PromotionBasicInfoProps {
  promotionName: string;
  giftDescription: string;
  onPromotionNameChange: (value: string) => void;
  onGiftDescriptionChange: (value: string) => void;
}

const PromotionBasicInfo = ({
  promotionName,
  giftDescription,
  onPromotionNameChange,
  onGiftDescriptionChange,
}: PromotionBasicInfoProps) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="promotionName">Promotion Name</Label>
      <Input
        id="promotionName"
        value={promotionName}
        onChange={(e) => onPromotionNameChange(e.target.value)}
        placeholder="e.g., Diwali Offer"
        className="hover:border-primary focus:border-primary transition-colors"
        required
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="giftDescription">Gift Description</Label>
      <Input
        id="giftDescription"
        value={giftDescription}
        onChange={(e) => onGiftDescriptionChange(e.target.value)}
        placeholder="e.g., Free silver coin with purchase"
      />
    </div>
  </>
);

export default PromotionBasicInfo;