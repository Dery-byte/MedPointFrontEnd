/** POST /api/mart/checkout */

import api from "../../shared/services/api";

export const martCheckout = async (cartItems) => {
  const response = await api.post("/mart/checkout", {
    items: cartItems.map(i => ({
      productId: i.id,
      quantity: i.qty,
    })),
  });
  return response.data;
};