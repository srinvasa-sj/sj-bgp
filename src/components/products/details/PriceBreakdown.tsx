import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PriceBreakdownProps {
  priceBreakdown: {
    baseAmount: number;
    wastageCharges: number;
    makingCharges: number;
    wastagePercentage: number;
    makingChargesPerGram: number;
  };
  originalPrice: number | null;
  promotionPrice: number | null;
  activePromotion: {
    promotionName?: string;
    giftDescription?: string;
    priceDiscount?: number;
    wastageDiscount?: number;
    makingChargesDiscount?: number;
  } | null;
  product: {
    weight: number;
    purity: string;
  };
}

const PriceBreakdown = ({
  priceBreakdown,
  originalPrice,
  promotionPrice,
  activePromotion,
  product
}: PriceBreakdownProps) => {
  const navigate = useNavigate();

  if (!priceBreakdown || !product) {
    console.log("Missing props:", { priceBreakdown, product });
    return <div>Loading...</div>;
  }

  console.log("Rendering PriceBreakdown with props:", {
    priceBreakdown,
    originalPrice,
    promotionPrice,
    activePromotion,
    product
  });

  // Check if promotion has any valid discounts
  const hasValidPromotion = activePromotion && 
    (typeof activePromotion.priceDiscount === 'number' || 
     typeof activePromotion.wastageDiscount === 'number' || 
     typeof activePromotion.makingChargesDiscount === 'number');

  console.log("Promotion status:", {
    hasValidPromotion,
    discounts: activePromotion ? {
      price: activePromotion.priceDiscount,
      wastage: activePromotion.wastageDiscount,
      making: activePromotion.makingChargesDiscount
    } : null
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-IN", { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 2 
    });
  };

  const calculateDiscountedPrice = (originalValue: number, discountPercentage: number) => {
    return originalValue * (1 - discountPercentage / 100);
  };

  const renderPriceCell = (
    originalValue: number,
    discountPercentage?: number
  ) => {
    const isDiscountAvailable = hasValidPromotion && discountPercentage > 0;

    if (!isDiscountAvailable) {
      return `₹${formatPrice(originalValue)}`;
    }

    const discountedValue = calculateDiscountedPrice(originalValue, discountPercentage);
    return (
      <>
        <span className={isDiscountAvailable ? 'line-through text-gray-500 mr-2' : ''}>
          ₹{formatPrice(originalValue)}
        </span>
        <span className={isDiscountAvailable ? 'text-green-600' : ''}>
          ₹{formatPrice(discountedValue)}
        </span>
      </>
    );
  };

  // Calculate the price per gram
  const pricePerGram = product.weight ? priceBreakdown.baseAmount / product.weight : 0;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/products")}
        className="mb-4 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <h2 className="text-2xl font-bold mb-4 text-center">Price Breakdown</h2>

      <div className="overflow-x-auto border rounded-lg">
        <Table className="border bg-white">
          <TableBody>
            {/* Table Header Row */}
            <TableRow className="bg-gray-200 border">
              <TableCell className="font-bold text-left border-r">Description</TableCell>
              <TableCell className="font-bold text-right">Price (₹)</TableCell>
            </TableRow>

            {/* Purity */}
            <TableRow className="border-t">
              <TableCell className="font-medium border-r">Purity</TableCell>
              <TableCell className="text-right">{product.purity}</TableCell>
            </TableRow>

            {/* Weight */}
            <TableRow className="border-t">
              <TableCell className="font-medium border-r">Weight</TableCell>
              <TableCell className="text-right">{product.weight ? `${product.weight}g` : "N/A"}</TableCell>
            </TableRow>

            {/* Price per gram */}
            <TableRow className="border-t">
              <TableCell className="font-medium border-r">Price per 1 gram
                {hasValidPromotion && activePromotion?.priceDiscount > 0 && (
                  <span className="text-red-500 ml-2">(Price Discount: {activePromotion.priceDiscount}%)</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {renderPriceCell(pricePerGram, activePromotion?.priceDiscount)}
              </TableCell>
            </TableRow>

            {/* Base Price */}
            <TableRow className="border-t">
              <TableCell className="font-medium border-r">Base Price</TableCell>
              <TableCell className="text-right">
                {renderPriceCell(priceBreakdown.baseAmount, activePromotion?.priceDiscount)}
              </TableCell>
            </TableRow>

            {/* Wastage Charges */}
            {product.purity !== "24 Karat" && (
              <TableRow className="border-t">
                <TableCell className="font-medium border-r">
                  Wastage Charges ({priceBreakdown.wastagePercentage}%)
                  {hasValidPromotion && activePromotion?.wastageDiscount > 0 && (
                    <span className="text-red-500 ml-2">(Wastage Discount: {activePromotion.wastageDiscount}%)</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {renderPriceCell(priceBreakdown.wastageCharges, activePromotion?.wastageDiscount)}
                </TableCell>
              </TableRow>
            )}

            {/* Total Making Charges */}
            {product.purity !== "24 Karat" && (
              <TableRow className="border-t">
                <TableCell className="font-medium border-r">
                  Total Making Charges ({priceBreakdown.makingChargesPerGram}₹/g)
                  {hasValidPromotion && activePromotion?.makingChargesDiscount > 0 && (
                    <span className="text-red-500 ml-2">(Making Charges Discount: {activePromotion.makingChargesDiscount}%)</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {renderPriceCell(priceBreakdown.makingCharges, activePromotion?.makingChargesDiscount)}
                </TableCell>
              </TableRow>
            )}

            {/* Total Price */}
            <TableRow className="bg-primary/5 border-t">
              <TableCell className="font-bold text-primary border-r">Total Price</TableCell>
              <TableCell className="text-right font-bold">
                {hasValidPromotion && promotionPrice !== null && originalPrice !== null ? (
                  <>
                    <span className="line-through text-gray-500 mr-2">
                      ₹{formatPrice(originalPrice)}
                    </span>
                    <span className="text-green-600">
                      ₹{formatPrice(promotionPrice)}
                    </span>
                  </>
                ) : (
                  originalPrice !== null ? `₹${formatPrice(originalPrice)}` : "Calculating..."
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Promotion Details */}
      {hasValidPromotion && (
        <div className="bg-green-100 text-green-700 p-4 mt-4 rounded-lg border border-green-400 text-center">
          <p className="font-bold">{activePromotion.promotionName}</p>
          {activePromotion.giftDescription && (
            <p className="text-sm mt-1">🎁 {activePromotion.giftDescription}</p>
          )}
          {/* <div className="mt-2 text-sm space-y-1">
            {typeof activePromotion.priceDiscount === 'number' && activePromotion.priceDiscount > 0 && (
              <p>Price Discount: {activePromotion.priceDiscount}%</p>
            )}
            {typeof activePromotion.wastageDiscount === 'number' && activePromotion.wastageDiscount > 0 && (
              <p>Wastage Charges Discount: {activePromotion.wastageDiscount}%</p>
            )}
            {typeof activePromotion.makingChargesDiscount === 'number' && activePromotion.makingChargesDiscount > 0 && (
              <p>Making Charges Discount: {activePromotion.makingChargesDiscount}%</p>
            )}
          </div> */}
        </div>
      )}
    </div>
  );
};

export default PriceBreakdown;
