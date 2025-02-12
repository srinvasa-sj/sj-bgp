
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
    activePromotion,
    product
  });

  // Calculate the price per gram
  const pricePerGram = product.weight ? priceBreakdown.baseAmount / product.weight : 0;
  const basePrice = pricePerGram * product.weight;

  // Fetch Wastage & Making Charges (If not 24 Karat)
  const baseWastageCharges = product.purity !== "24 Karat" ? priceBreakdown.wastageCharges : 0;
  const baseMakingCharges = product.purity !== "24 Karat" ? priceBreakdown.makingCharges : 0;

  // Apply promotional discounts if active
  const discountedBasePrice = activePromotion?.priceDiscount
    ? basePrice * (1 - activePromotion.priceDiscount / 100)
    : basePrice;

  const discountedWastageCharges = activePromotion?.wastageDiscount
    ? baseWastageCharges * (1 - activePromotion.wastageDiscount / 100)
    : baseWastageCharges;

  const discountedMakingCharges = activePromotion?.makingChargesDiscount
    ? baseMakingCharges * (1 - activePromotion.makingChargesDiscount / 100)
    : baseMakingCharges;

  // Calculate the final offer price as the sum of discounted values
  const calculatedOfferPrice = discountedBasePrice + discountedWastageCharges + discountedMakingCharges;
  const calculatedOriginalTotal = basePrice + baseWastageCharges + baseMakingCharges;

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
              <TableCell className="font-medium border-r">Price per 1 gram</TableCell>
              <TableCell className="text-right">
                {activePromotion ? (
                  <>
                    <span className="line-through text-gray-500 mr-2">
                      ₹{pricePerGram.toFixed(2)}
                    </span>
                    <span className="text-green-600">
                      ₹{(pricePerGram * (1 - activePromotion.priceDiscount / 100)).toFixed(2)}
                    </span>
                  </>
                ) : (
                  `₹${pricePerGram.toFixed(2)}`
                )}
              </TableCell>
            </TableRow>

            {/* Base Price */}
            <TableRow className="border-t">
              <TableCell className="font-medium border-r">Base Price</TableCell>
              <TableCell className="text-right">
                {activePromotion ? (
                  <>
                    <span className="line-through text-gray-500 mr-2">
                      ₹{basePrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-green-600">
                      ₹{discountedBasePrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </>
                ) : (
                  `₹${basePrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                )}
              </TableCell>
            </TableRow>

            {/* Wastage Charges */}
            {product.purity !== "24 Karat" && (
              <TableRow className="border-t">
                <TableCell className="font-medium border-r">
                  Wastage Charges ({priceBreakdown.wastagePercentage}%)
                </TableCell>
                <TableCell className="text-right">
                  {activePromotion ? (
                    <>
                      <span className="line-through text-gray-500 mr-2">
                        ₹{baseWastageCharges.toFixed(2)}
                      </span>
                      <span className="text-green-600">
                        ₹{discountedWastageCharges.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    `₹${baseWastageCharges.toFixed(2)}`
                  )}
                </TableCell>
              </TableRow>
            )}

            {/* Total Making Charges */}
            {product.purity !== "24 Karat" && (
              <TableRow className="border-t">
                <TableCell className="font-medium border-r">
                  Total Making Charges ({priceBreakdown.makingChargesPerGram}₹/g)
                </TableCell>
                <TableCell className="text-right">
                  {activePromotion ? (
                    <>
                      <span className="line-through text-gray-500 mr-2">
                        ₹{baseMakingCharges.toFixed(2)}
                      </span>
                      <span className="text-green-600">
                        ₹{discountedMakingCharges.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    `₹${baseMakingCharges.toFixed(2)}`
                  )}
                </TableCell>
              </TableRow>
            )}

            {/* Total Price */}
            <TableRow className="bg-primary/5 border-t">
              <TableCell className="font-bold text-primary border-r">Total Price</TableCell>
              <TableCell className="text-right font-bold">
                {activePromotion ? (
                  <>
                    <span className="line-through text-gray-500 mr-2">
                      ₹{calculatedOriginalTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-green-600">
                      ₹{calculatedOfferPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </>
                ) : (
                  `₹${calculatedOfferPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Promotion Details */}
      {activePromotion && (
        <div className="bg-green-100 text-green-700 p-4 mt-4 rounded-lg border border-green-400 text-center">
          <p className="font-bold">{activePromotion.promotionName}</p>
          {activePromotion.giftDescription && (
            <p className="text-sm mt-1">🎁 {activePromotion.giftDescription}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceBreakdown;
