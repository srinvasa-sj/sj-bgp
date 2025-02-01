import { useState } from "react";
import { CartItem } from "@/types/cart";

export const useCartState = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const total = items.reduce(
    (sum, item) => sum + item.price_at_time * item.quantity,
    0
  );

  return {
    items,
    setItems,
    isLoading,
    setIsLoading,
    total,
  };
};