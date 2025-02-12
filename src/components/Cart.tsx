import { X } from "lucide-react";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl animate-slideIn">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Your Cart</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-[calc(100vh-200px)] overflow-auto">
            <div className="text-center text-muted-foreground py-12">
              Your cart is empty
            </div>
          </div>

          <div className="border-t mt-auto pt-4">
            <div className="flex justify-between mb-4">
              <span>Subtotal</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <button className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 transition-opacity">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;