// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// interface PromotionDiscountsProps {
//   priceDiscount: string;
//   wastageDiscount: string;
//   makingChargesDiscount: string;
//   onPriceDiscountChange: (value: string) => void;
//   onWastageDiscountChange: (value: string) => void;
//   onMakingChargesDiscountChange: (value: string) => void;
// }

// const PromotionDiscounts = ({
//   priceDiscount,
//   wastageDiscount,
//   makingChargesDiscount,
//   onPriceDiscountChange,
//   onWastageDiscountChange,
//   onMakingChargesDiscountChange,
// }: PromotionDiscountsProps) => (
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//     <div className="space-y-2">
//       <Label htmlFor="priceDiscount">Price Discount (%)</Label>
//       <Input
//         type="number"
//         id="priceDiscount"
//         value={priceDiscount}
//         onChange={(e) => onPriceDiscountChange(e.target.value)}
//         min="0"
//         max="99.99"
//         step="0.01"
//         className="hover:border-primary focus:border-primary transition-colors"
//         required
//       />
//     </div>

//     <div className="space-y-2">
//       <Label htmlFor="wastageDiscount">Wastage Charges Discount (%)</Label>
//       <Input
//         type="number"
//         id="wastageDiscount"
//         value={wastageDiscount}
//         onChange={(e) => onWastageDiscountChange(e.target.value)}
//         min="0"
//         max="99.99"
//         step="0.01"
//         className="hover:border-primary focus:border-primary transition-colors"
//         required
//       />
//     </div>

//     <div className="space-y-2">
//       <Label htmlFor="makingChargesDiscount">Making Charges Discount (%)</Label>
//       <Input
//         type="number"
//         id="makingChargesDiscount"
//         value={makingChargesDiscount}
//         onChange={(e) => onMakingChargesDiscountChange(e.target.value)}
//         min="0"
//         max="99.99"
//         step="0.01"
//         className="hover:border-primary focus:border-primary transition-colors"
//         required
//       />
//     </div>
//   </div>
// );

// export default PromotionDiscounts;

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PromotionDiscountsProps {
  priceDiscount: string;
  wastageDiscount: string;
  makingChargesDiscount: string;
  onPriceDiscountChange: (value: string) => void;
  onWastageDiscountChange: (value: string) => void;
  onMakingChargesDiscountChange: (value: string) => void;
}

const PromotionDiscounts = ({
  priceDiscount,
  wastageDiscount,
  makingChargesDiscount,
  onPriceDiscountChange,
  onWastageDiscountChange,
  onMakingChargesDiscountChange,
}: PromotionDiscountsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="space-y-2">
      <Label htmlFor="priceDiscount">Price Discount (%)</Label>
      <Input
        type="number"
        id="priceDiscount"
        value={priceDiscount}
        onChange={(e) => onPriceDiscountChange(e.target.value)}
        min="0"
        max="99.99"
        step="0.01"
        className="hover:border-primary focus:border-primary transition-colors"
        placeholder="Enter price discount"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="wastageDiscount">Wastage Charges Discount (%)</Label>
      <Input
        type="number"
        id="wastageDiscount"
        value={wastageDiscount}
        onChange={(e) => onWastageDiscountChange(e.target.value)}
        min="0"
        max="99.99"
        step="0.01"
        className="hover:border-primary focus:border-primary transition-colors"
        placeholder="Enter wastage discount"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="makingChargesDiscount">Making Charges Discount (%)</Label>
      <Input
        type="number"
        id="makingChargesDiscount"
        value={makingChargesDiscount}
        onChange={(e) => onMakingChargesDiscountChange(e.target.value)}
        min="0"
        max="99.99"
        step="0.01"
        className="hover:border-primary focus:border-primary transition-colors"
        placeholder="Enter making charges discount"
      />
    </div>
  </div>
);

export default PromotionDiscounts;