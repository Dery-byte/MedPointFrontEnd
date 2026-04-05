// import { useApp } from "../../AppContext";
// import ProductList from "./ProductList";
// import MartCart from "./MartCart";

// export default function MartModule() {
//   const { state, dispatch } = useApp();
//   const { mCart, products } = state;

//   const toggle = (id) => {
//     const p = products.find(p => p.id === id);
//     if (!p) return;
//     if (p.stock <= 0) { alert("Out of stock!"); return; }
//     if (mCart.some(c => c.id === id)) dispatch({ type: "MART_REMOVE", id });
//     else dispatch({ type: "MART_ADD", item: p });
//   };

//   const onCheckout = () => {
//     const total = mCart.reduce((s, i) => s + i.price * i.qty, 0);
//     dispatch({ type: "REDUCE_PRODUCT_STOCK", items: mCart });
//     dispatch({ type: "ADD_TX", mod: "mart", amount: total, desc: `Mart Sale (${mCart.length} items)`, lineItems: mCart.map(i => ({ name: i.name, qty: i.qty, price: i.price, cat: i.cat })) });
//     dispatch({ type: "SHOW_RECEIPT", data: { type: "Mart Sale", mod: "mart", items: mCart.map(i => ({ ...i })), total, service: null } });
//     dispatch({ type: "MART_CLEAR" });
//   };

//   return (
//     <div>
//       <div className="pg-hd"><h2>Mart</h2><p>Browse products, add to cart and checkout</p></div>
//       <div className="split">
//         <ProductList onToggle={toggle} />
//         <MartCart onCheckout={onCheckout} />
//       </div>
//     </div>
//   );
// }



import { useApp } from "../../AppContext";
import ProductList from "./ProductList";
import MartCart from "./MartCart";
import { martCheckout } from "../../services/martService";

export default function MartModule() {
  const { state, dispatch } = useApp();
  const { mCart, products } = state;

  const toggle = (id) => {
    const p = products.find(p => p.id === id);
    if (!p) return;
    if (p.stock <= 0) { alert("Out of stock!"); return; }
    if (mCart.some(c => c.id === id)) dispatch({ type: "MART_REMOVE", id });
    else dispatch({ type: "MART_ADD", item: p });
  };

  const onCheckout = async () => {
    try {
      const tx = await martCheckout(mCart);

      dispatch({ type: "REDUCE_PRODUCT_STOCK", items: mCart });
      dispatch({
        type: "ADD_TX",
        mod: "mart",
        amount: tx.amount,
        desc: tx.description,
        lineItems: tx.lineItems ?? mCart.map(i => ({
          name: i.name, qty: i.qty, price: i.price, cat: i.cat,
          costPrice: i.costPrice ?? null,
        })),
      });
      // Build items from backend response if available
      const receiptItems = tx.lineItems
        ? tx.lineItems.map(li => ({
            id:    li.id ?? li.itemId,
            name:  li.name,
            cat:   li.category ?? li.cat,
            price: parseFloat(li.unitPrice ?? li.price),
            qty:   li.quantity ?? li.qty,
          }))
        : mCart.map(i => ({ ...i }));

      dispatch({
        type: "SHOW_RECEIPT",
        data: {
          type:      "Mart Sale",
          mod:       "mart",
          items:     receiptItems,
          total:     tx.amount,
          reference: tx.reference,
          service:   null,
        },
      });
      dispatch({ type: "MART_CLEAR" });

    } catch (err) {
      const message = err.response?.data?.message || "Checkout failed. Please try again.";
      alert(message);
      console.error("Checkout error:", err);
    }
  };

  return (
    <div>
      <div className="pg-hd"><h2>Mart</h2><p>Browse products, add to cart and checkout</p></div>
      <div className="split">
        <ProductList onToggle={toggle} />
        <MartCart onCheckout={onCheckout} />
      </div>
    </div>
  );
}