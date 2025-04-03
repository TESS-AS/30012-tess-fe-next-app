import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";  
import { IProductSearch, ISuggestions } from "../types/search.types";
import { loadItem } from "../services/product.service";

const SearchBarComponent: React.FC = () => {
  const [products, setProducts] = useState<IProductSearch[]>([]);
  const [suggestions, setSuggestions] = useState<ISuggestions[]>([]);
  const [query, setQuery] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.length === 0) {
      setProducts([]);
      setSuggestions([]);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await loadItem(query);
        if (response !== false) {
          setProducts(response.productRes);
          setSuggestions(response.searchSuggestions);
          setIsExpanded(true);
        } else {
          setProducts([]);
          setSuggestions([]);
          setIsExpanded(false);
        }
      } catch (error) {
        console.error("Could not fetch results", error);
        setProducts([]);
        setSuggestions([]);
      }
    };

    fetchData();
  }, [query]);

  return (
    <div className="relative max-w-xl w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/searchList/${query || "Slanger"}`);
        }}
        className="w-full"
      >
        <div className="flex w-full">
          <input
            type="search"
            placeholder="Søk etter produkter..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setIsExpanded(false)}
            className="w-full rounded-l-md border border-gray-300 py-2 px-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onMouseDown={(e) => e.preventDefault()}
            className="bg-green-700 border-none py-2 px-4 rounded-r-md flex items-center transition-colors hover:bg-green-200"
            onClick={() => router.push(`/searchList/${query || "Slanger"}`)}
          >
            <Image src="/icons/Vector.svg" className="text-white" alt="Søk" width={24} height={24} />
          </button>
        </div>
      </form>

      {isExpanded && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg rounded-lg z-10 mt-1 max-h-96 overflow-y-auto flex">
          <div className="flex-1 border-r border-gray-200 p-3">
            <div className="font-bold text-center text-gray-700 mb-2">Søkeforslag</div>
            {suggestions.length > 0 ? (
              <ul className="list-none p-0 m-0">
                {suggestions.map((s, index) => (
                  <li key={index} className="text-center py-2 border-b border-gray-200">
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        router.push(`/searchList/${encodeURIComponent(s.keyword)}`)
                      }
                      className="w-full py-2 px-4 text-green-700 bg-transparent border-none text-left rounded-md transition-all hover:bg-gray-100 hover:shadow-md"
                    >
                      {s.keyword}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 text-center py-4">Ingen forslag</div>
            )}
          </div>

          <div className="flex-2 p-3">
            {products.length > 0 ? (
              products.map((item, key) => (
                <a
                  onMouseDown={(e) => e.preventDefault()}
                  key={key}
                  href={`/product/${item.product_number}`}
                  className="flex justify-between items-center py-3 text-gray-800 border-b border-gray-200 rounded-md transition-all hover:bg-gray-50 hover:shadow-md"
                >
                <div className="flex flex-col">
                    <span>{item.product_name}</span>
                    <small className="text-gray-500 italic">{item.product_number}</small>
                </div>
                <Image
                    src={item.media}
                    alt={item.product_name}
                    width={128}
                    height={128}
                    className="object-contain ml-3"
                />
                </a>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">Ingen produkter funnet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBarComponent;
