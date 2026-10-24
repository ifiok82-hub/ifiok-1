"use client";
import { useState } from "react";

const PRODUCTS = [
  { id: 1, name: "Fresh Groceries Bundle", price: 3.5, cat: "Groceries", emoji: "🥦" },
  { id: 2, name: "Golden Fields 50KG Rice", price: 8.5, cat: "Groceries", emoji: "🍚" },
  { id: 3, name: "Fresh Palm Oil 25L Keg", price: 5.0, cat: "Groceries", emoji: "🫒" },
  { id: 4, name: "Infinix Note 40 Pro 5G", price: 22.0, cat: "Electronics", emoji: "📱" },
  { id: 5, name: "Wireless Bluetooth Headset", price: 1.2, cat: "Electronics", emoji: "🎧" },
  { id: 6, name: "Solar Power Bank 20000mAh", price: 3.5, cat: "Electronics", emoji: "🔋" },
  { id: 7, name: "Ankara Senator Wear", price: 6.0, cat: "Fashion", emoji: "👔" },
  { id: 8, name: "Ankara Female Gown", price: 4.5, cat: "Fashion", emoji: "👗" },
  { id: 9, name: "Solar Inverter Kit 3KVA", price: 85.0, cat: "Energy", emoji: "☀️" },
  { id: 10, name: "Cookware Set Non-Stick", price: 9.5, cat: "Home", emoji: "🍳" },
  { id: 11, name: "Office Chair Ergonomic", price: 18.0, cat: "Home", emoji: "🪑" },
  { id: 12, name: "Shea Butter Kit", price: 2.0, cat: "Beauty", emoji: "🧴" },
  { id: 13, name: "Electrical Installation Service", price: 2.5, cat: "Services", emoji: "🔧" },
];

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const cats = ["All", "Groceries", "Electronics", "Fashion", "Energy", "Home", "Beauty", "Services"];
  const filtered = filter==="All" ? PRODUCTS : PRODUCTS.filter(p=>p.cat===filter);
  const total = cart.reduce((s:any,i:any)=>s+i.price,0);
  
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4">
      <header className="max-w-7xl mx-auto flex justify-between items-center py-4 border-b border-zinc-800 mb-6">
        <h1 className="text-2xl font-black">IFIOK <span className="text-purple-400">LIVE</span></h1>
        <div className="bg-purple-600 px-4 py-2 rounded-full text-sm">MAINNET PI-ONLY LIVE</div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {cats.map(c=>(
            <button key={c} onClick={()=>setFilter(c)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${filter===c?'bg-white text-black':'bg-zinc-800'}`}>{c}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p=>(
            <div key={p.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="text-5xl mb-3">{p.emoji}</div>
              <div className="text-xs text-zinc-500 mb-1">{p.cat}</div>
              <h3 className="font-bold mb-2 h-12">{p.name}</h3>
              <div className="flex justify-between items-center mt-3">
                <span className="text-purple-400 font-black">π {p.price}</span>
                <button onClick={()=>setCart([...cart,p])} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold">Add</button>
              </div>
            </div>
          ))}
        </div>

        {cart.length>0 && (
          <div className="fixed bottom-4 right-4 bg-white text-black rounded-2xl p-4 shadow-2xl w-80">
            <h3 className="font-black mb-2">Cart ({cart.length})</h3>
            {cart.map((c,i)=><div key={i} className="flex justify-between text-sm py-1"><span>{c.name}</span><span>π{c.price}</span></div>)}
            <div className="border-t mt-2 pt-2 flex justify-between font-black"><span>Total</span><span>π {total.toFixed(1)}</span></div>
            <button className="w-full bg-purple-600 text-white mt-3 py-3 rounded-full font-black">Pay π with Pi</button>
            <button onClick={()=>setCart([])} className="w-full text-zinc-500 text-sm mt-2">Clear</button>
          </div>
        )}

        <div className="mt-12 text-center text-zinc-600 text-xs">
          <p>13 LIVE PRODUCTS • Pi Mainnet Only • No USD • ifiok-1.vercel.app</p>
          <p className="mt-2">5-tap IFIOK logo → Admin: IfiokAdmin2025!</p>
        </div>
      </div>
    </main>
  );
}

