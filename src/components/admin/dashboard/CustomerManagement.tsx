import { Button } from "@/components/ui/button";
import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import type { CustomerData } from "@/types/customer";

interface CustomerManagementProps {
  customers: CustomerData[];
  setCustomers: (customers: CustomerData[]) => void;
}

const CustomerManagement = ({ customers, setCustomers }: CustomerManagementProps) => {
  const [showCustomers, setShowCustomers] = useState(false);

  const handleDeleteAllCustomers = async () => {
    try {
      const batch = customers.map(customer => 
        deleteDoc(doc(db, "customerData", customer.id))
      );
      await Promise.all(batch);
      setCustomers([]);
      toast.success("All customer data deleted");
    } catch (error) {
      console.error("Error deleting customers:", error);
      toast.error("Error deleting customers");
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Customer Contact Details</h2>
      <div className="flex gap-4">
        <Button onClick={() => setShowCustomers(!showCustomers)}>
          {showCustomers ? "Hide" : "View"} Customers
        </Button>
        <Button 
          variant="destructive"
          onClick={handleDeleteAllCustomers}
          className="transition-all duration-300 hover:scale-105"
        >
          Delete All Customers
        </Button>
      </div>

      {showCustomers && (
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="p-4 bg-muted rounded-lg">
              <p><strong>Name:</strong> {customer.firstName} {customer.lastName}</p>
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Phone:</strong> {customer.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;