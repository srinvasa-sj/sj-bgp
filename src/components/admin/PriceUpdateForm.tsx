import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PriceUpdateForm = () => {
  const [formData, setFormData] = useState({
    price18Karat: "",
    price20Karat: "",
    price22Karat: "",
    price24Karat: "",
    priceSilver1: "",
    priceSilver2: "",
    goldwastageCharges: "",
    goldmakingCharges: "",
    wastageChargesSilver: "",
    makingChargesSilver: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const numericFormData = Object.entries(formData).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: parseFloat(value) || 0,
      }), {});

      // Add timestamp when updating prices
      await setDoc(doc(db, "priceData", "OTjdBq7kTmGMXWDpMKvg"), {
        ...numericFormData,
        timestamp: serverTimestamp()
      });
      
      toast.success("Price details updated successfully!");
      
      // Reset form after successful submission
      setFormData({
        price18Karat: "",
        price20Karat: "",
        price22Karat: "",
        price24Karat: "",
        priceSilver1: "",
        priceSilver2: "",
        goldwastageCharges: "",
        goldmakingCharges: "",
        wastageChargesSilver: "",
        makingChargesSilver: "",
      });
    } catch (error) {
      console.error("Error saving price details:", error);
      toast.error("Error saving price details");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6">Update Gold and Silver Prices</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price18Karat">18 Karat Gold Price (per gram)</Label>
            <Input
              type="number"
              id="price18Karat"
              value={formData.price18Karat}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price20Karat">20 Karat Gold Price (per gram)</Label>
            <Input
              type="number"
              id="price20Karat"
              value={formData.price20Karat}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price22Karat">22 Karat Gold Price (per gram)</Label>
            <Input
              type="number"
              id="price22Karat"
              value={formData.price22Karat}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price24Karat">24 Karat Gold Price (per gram)</Label>
            <Input
              type="number"
              id="price24Karat"
              value={formData.price24Karat}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goldwastageCharges">Gold Wastage Charges (%)</Label>
            <Input
              type="number"
              id="goldwastageCharges"
              value={formData.goldwastageCharges}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goldmakingCharges">Gold Making Charges (per gram)</Label>
            <Input
              type="number"
              id="goldmakingCharges"
              value={formData.goldmakingCharges}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceSilver1">Fine Silver-99.9% Price (per gram)</Label>
            <Input
              type="number"
              id="priceSilver1"
              value={formData.priceSilver1}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceSilver2">Sterling Silver-92.5% Price (per gram)</Label>
            <Input
              type="number"
              id="priceSilver2"
              value={formData.priceSilver2}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wastageChargesSilver">Silver Wastage Charges (%)</Label>
            <Input
              type="number"
              id="wastageChargesSilver"
              value={formData.wastageChargesSilver}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="makingChargesSilver">Silver Making Charges (per gram)</Label>
            <Input
              type="number"
              id="makingChargesSilver"
              value={formData.makingChargesSilver}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full">Save Prices</Button>
      </form>
    </div>
  );
};

export default PriceUpdateForm;
