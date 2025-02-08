import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PromotionEditForm from "./PromotionEditForm";

interface Promotion {
  id: string;
  promotionName: string;
  startDate: string;
  endDate: string;
  priceDiscount: number;
  wastageDiscount: number;
  makingChargesDiscount: number;
  giftDescription: string;
  productName: string;
}

const PromotionList = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "promotions"));
      const fetchedPromotions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Promotion[];

      console.log("Fetched promotions:", fetchedPromotions);
      setPromotions(fetchedPromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Error fetching promotions");
    }
  };

  const handleDelete = async (promotionId: string) => {
    try {
      await deleteDoc(doc(db, "promotions", promotionId));
      setPromotions(promotions.filter(p => p.id !== promotionId));
      toast.success("Promotion deleted successfully");
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Error deleting promotion");
    }
  };

  const handleUpdate = async (updatedPromotion: Promotion) => {
    try {
      const promotionRef = doc(db, "promotions", updatedPromotion.id);
      await updateDoc(promotionRef, {
        promotionName: updatedPromotion.promotionName,
        startDate: updatedPromotion.startDate,
        endDate: updatedPromotion.endDate,
        priceDiscount: updatedPromotion.priceDiscount,
        wastageDiscount: updatedPromotion.wastageDiscount,
        makingChargesDiscount: updatedPromotion.makingChargesDiscount,
        giftDescription: updatedPromotion.giftDescription,
      });

      setPromotions(promotions.map(p => 
        p.id === updatedPromotion.id ? updatedPromotion : p
      ));
      
      toast.success("Promotion updated successfully");
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error("Error updating promotion");
    }
  };

  const isPromotionActive = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= now && end >= now;
  };

  const renderPromotionTable = (isActive: boolean) => {
    const filteredPromotions = promotions.filter(promo => 
      isPromotionActive(promo.startDate, promo.endDate) === isActive
    );

    if (filteredPromotions.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No {isActive ? "active" : "inactive"} promotions found
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Discounts</TableHead>
            <TableHead>Gift</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPromotions.map(promotion => (
            <TableRow key={promotion.id}>
              <TableCell className="font-medium">{promotion.promotionName}</TableCell>
              <TableCell>{promotion.productName}</TableCell>
              <TableCell>
                {new Date(promotion.startDate).toLocaleDateString()} - 
                {new Date(promotion.endDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge variant="outline">Price: {promotion.priceDiscount}%</Badge>
                  <Badge variant="outline">Wastage: {promotion.wastageDiscount}%</Badge>
                  <Badge variant="outline">Making: {promotion.makingChargesDiscount}%</Badge>
                </div>
              </TableCell>
              <TableCell>{promotion.giftDescription || "No gift"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedPromotion(promotion)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Promotion</DialogTitle>
                      </DialogHeader>
                      {selectedPromotion && (
                        <PromotionEditForm
                          promotion={selectedPromotion}
                          onUpdate={handleUpdate}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(promotion.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Promotions</h3>
        {renderPromotionTable(true)}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Inactive Promotions</h3>
        {renderPromotionTable(false)}
      </div>
    </div>
  );
};

export default PromotionList;