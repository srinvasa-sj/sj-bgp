import { Gift } from "lucide-react";

const PromotionHeader = () => (
  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
    <Gift className="h-6 w-6" />
    Add New Promotion
  </h2>
);

export default PromotionHeader;