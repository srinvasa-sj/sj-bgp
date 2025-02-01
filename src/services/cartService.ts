import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/cart";

export const cartService = {
  async fetchCart() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No authenticated user");
      return null;
    }

    const { data: cart, error } = await supabase
      .from("carts")
      .select("id")
      .eq("status", "active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({ 
          status: "active",
          user_id: user.id
        })
        .select()
        .single();

      if (createError) throw createError;
      return newCart.id;
    }

    return cart.id;
  },

  async fetchCartItems(cartId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        product_id,
        quantity,
        price_at_time,
        products (
          name,
          product_images (url)
        )
      `)
      .eq("cart_id", cartId);

    if (error) throw error;

    return data.map((item) => ({
      ...item,
      product: {
        name: item.products.name,
        image: item.products.product_images?.[0]?.url,
      },
    }));
  },

  async addItem(cartId: string, productId: string, quantity: number, price: number) {
    const { error } = await supabase.from("cart_items").insert({
      cart_id: cartId,
      product_id: productId,
      quantity,
      price_at_time: price,
    });

    if (error) throw error;
  },

  async removeItem(itemId: string) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
  },

  async updateQuantity(itemId: string, quantity: number) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);

    if (error) throw error;
  },

  async clearCart(cartId: string) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (error) throw error;
  },
};