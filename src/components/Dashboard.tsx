"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const allergyOptions = [
  "Milk",
  "Eggs",
  "Fish",
  "Crustacean Shellfish",
  "Tree Nuts",
  "Peanuts",
  "Wheat",
  "Soybeans",
  "Sesame",
];

const religiousOptions = [
  "Kosher",
  "Halal",
  "Hindu",
  "Fasting during religious holidays",
];

const lifestyleOptions = [
  "Vegan",
  "Vegetarian",
  "Pescatarian",
  "Dairy-free",
];


const navLinks = [
 { href: "/", label: "Map" },
 { href: "/index-page", label: "Index" },
 { href: "/resources", label: "Resources" },
 { href: "/about", label: "About" },
 { href: "/contact", label: "Contact" },
];


export default function Dashboard() {
 const pathname = usePathname();
 const router = useRouter();
 const [allergyOpen, setAllergyOpen] = useState(false);
 const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
 const [otherAllergy, setOtherAllergy] = useState("");
 const dropdownRef = useRef<HTMLDivElement>(null);

 const [religiousOpen, setReligiousOpen] = useState(false);
 const [selectedReligious, setSelectedReligious] = useState<string[]>([]);
 const religiousRef = useRef<HTMLDivElement>(null);

 const [lifestyleOpen, setLifestyleOpen] = useState(false);
 const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>([]);
 const lifestyleRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
   const handleClickOutside = (e: MouseEvent) => {
     if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
       setAllergyOpen(false);
     }
     if (religiousRef.current && !religiousRef.current.contains(e.target as Node)) {
       setReligiousOpen(false);
     }
     if (lifestyleRef.current && !lifestyleRef.current.contains(e.target as Node)) {
       setLifestyleOpen(false);
     }
   };
   document.addEventListener("mousedown", handleClickOutside);
   return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const toggle = (
   item: string,
   setter: React.Dispatch<React.SetStateAction<string[]>>
 ) => {
   setter((prev) =>
     prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
   );
 };

 const doSearch = (query: string) => {
   if (query) router.push(`/?q=${encodeURIComponent(query)}`);
 };

 const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
   if (e.key === "Enter") {
     doSearch((e.target as HTMLInputElement).value.trim());
   }
 };

 const handleSearchClick = () => {
   const input = document.querySelector<HTMLInputElement>(".search-input");
   doSearch(input?.value.trim() || "");
 };


 return (
   <header className="relative z-[1000] flex flex-col px-6 py-4 bg-white shadow-sm gap-3">
     <div className="flex items-center justify-between">
       <Link href="/" className="no-underline">
         <h1 className="text-xl font-semibold text-gray-900 whitespace-nowrap">
           Travel Allergy Readiness Index Map
         </h1>
       </Link>

       <nav className="flex items-center gap-3">
         {navLinks.map(({ href, label }) => (
           <Link
             key={href}
             href={href}
             className={`px-4 py-2 text-sm font-medium rounded-md border no-underline transition-colors ${
               pathname === href
                 ? "bg-blue-500 text-white border-blue-500"
                 : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
             }`}
           >
             {label}
           </Link>
         ))}
       </nav>
     </div>

     <div className="flex items-center gap-3">
       <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:border-blue-500 transition-colors">
         <input
           type="search"
           className="search-input px-4 py-2 min-w-[200px] text-sm border-none outline-none"
           placeholder="Search a location"
           aria-label="Search location"
           onKeyDown={handleSearch}
         />
         <button
           type="button"
           onClick={handleSearchClick}
           aria-label="Search"
           className="flex items-center justify-center px-2.5 py-2 border-l border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
         >
           <svg
             xmlns="http://www.w3.org/2000/svg"
             width="16"
             height="16"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             strokeWidth="2"
             strokeLinecap="round"
             strokeLinejoin="round"
           >
             <circle cx="11" cy="11" r="8" />
             <line x1="21" y1="21" x2="16.65" y2="16.65" />
           </svg>
         </button>
       </div>

       <div className="relative" ref={dropdownRef}>
         <button
           type="button"
           onClick={() => setAllergyOpen(!allergyOpen)}
           className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md border bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors"
         >
           Allergies{selectedAllergies.length > 0 ? ` (${selectedAllergies.length})` : ""}
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <polyline points="6 9 12 15 18 9" />
           </svg>
         </button>

         {allergyOpen && (
           <div className="absolute top-full mt-1 right-0 w-56 bg-white border border-gray-300 rounded-md shadow-lg py-2">
             {allergyOptions.map((allergy) => (
               <label
                 key={allergy}
                 className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
               >
                 <input
                   type="checkbox"
                   checked={selectedAllergies.includes(allergy)}
                   onChange={() => toggle(allergy, setSelectedAllergies)}
                   className="rounded"
                 />
                 {allergy}
               </label>
             ))}
             <div className="border-t border-gray-200 mt-1 pt-1 px-3">
               <label className="flex items-center gap-2 py-1.5 text-sm text-gray-700">
                 <input
                   type="checkbox"
                   checked={selectedAllergies.includes(otherAllergy) && otherAllergy !== ""}
                   onChange={() => {
                     if (otherAllergy) toggle(otherAllergy, setSelectedAllergies);
                   }}
                   className="rounded"
                 />
                 Other
               </label>
               <input
                 type="text"
                 placeholder="Type allergy..."
                 value={otherAllergy}
                 onChange={(e) => {
                   const prev = otherAllergy;
                   const next = e.target.value;
                   setOtherAllergy(next);
                   if (prev && selectedAllergies.includes(prev)) {
                     setSelectedAllergies((s) =>
                       next ? s.map((a) => (a === prev ? next : a)) : s.filter((a) => a !== prev)
                     );
                   }
                 }}
                 className="w-full mt-1 mb-1 px-2 py-1 text-sm border border-gray-300 rounded outline-none focus:border-blue-500"
               />
             </div>
           </div>
         )}
       </div>

       <div className="relative" ref={religiousRef}>
         <button
           type="button"
           onClick={() => setReligiousOpen(!religiousOpen)}
           className="flex items-center gap-1.5 w-[210px] px-4 py-2 text-sm font-medium rounded-md border bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors"
         >
           Religious/Cultural{selectedReligious.length > 0 ? ` (${selectedReligious.length})` : ""}
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <polyline points="6 9 12 15 18 9" />
           </svg>
         </button>

         {religiousOpen && (
           <div className="absolute top-full mt-1 left-0 w-64 bg-white border border-gray-300 rounded-md shadow-lg py-2">
             {religiousOptions.map((item) => (
               <label
                 key={item}
                 className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
               >
                 <input
                   type="checkbox"
                   checked={selectedReligious.includes(item)}
                   onChange={() => toggle(item, setSelectedReligious)}
                   className="rounded"
                 />
                 {item}
               </label>
             ))}
           </div>
         )}
       </div>

       <div className="relative" ref={lifestyleRef}>
         <button
           type="button"
           onClick={() => setLifestyleOpen(!lifestyleOpen)}
           className="flex items-center gap-1.5 w-[190px] px-4 py-2 text-sm font-medium rounded-md border bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors"
         >
           Lifestyle/Ethical{selectedLifestyle.length > 0 ? ` (${selectedLifestyle.length})` : ""}
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <polyline points="6 9 12 15 18 9" />
           </svg>
         </button>

         {lifestyleOpen && (
           <div className="absolute top-full mt-1 left-0 w-56 bg-white border border-gray-300 rounded-md shadow-lg py-2">
             {lifestyleOptions.map((item) => (
               <label
                 key={item}
                 className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
               >
                 <input
                   type="checkbox"
                   checked={selectedLifestyle.includes(item)}
                   onChange={() => toggle(item, setSelectedLifestyle)}
                   className="rounded"
                 />
                 {item}
               </label>
             ))}
           </div>
         )}
       </div>
     </div>
   </header>
 );
}
