import React, { useEffect, useRef, useCallback } from 'react';
import {ShoppingBag, KeyboardArrowDown, KeyboardArrowUp, ShoppingBagOutlined} from '@mui/icons-material';
import { ProductDetailSidebarProps } from '@/lib/types';

const ProductDetailSidebar: React.FC<ProductDetailSidebarProps> = React.memo(({
  products,
  collapsedProducts,
  manualToggled,
  onToggleCollapse,
  isLoading = false,
  currentTime = 0,
  onProductClick,
  highlightedProduct,
}) => {
  const productRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveProductRef = useRef<string | null>(null);

      // Handle user scroll detection
  const handleScroll = useCallback(() => {
    isUserScrollingRef.current = true;

    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Reset user scrolling flag after 2 seconds of no scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2000);
  }, []);

  // Reset state when products change
  useEffect(() => {
    // Reset scroll position when products change
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
    // Reset tracking refs
    lastActiveProductRef.current = null;
    isUserScrollingRef.current = false;
  }, [products]);

  // Add scroll listener
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        sidebar.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll]);

    // Auto-scroll to active product when currentTime changes (only if user is not scrolling)
  useEffect(() => {
    if (products.length === 0 || isUserScrollingRef.current) return;

    // Find all active products at current time
    const activeProducts = products.filter(product =>
      currentTime >= product.timeline[0] && currentTime <= product.timeline[1]
    );

    if (activeProducts.length === 0) {
      lastActiveProductRef.current = null;
      return;
    }

    // Sort by duration (shortest first) to prioritize products with shorter timeslots
    const prioritizedProduct = activeProducts.reduce((shortest, current) => {
      const shortestDuration = shortest.timeline[1] - shortest.timeline[0];
      const currentDuration = current.timeline[1] - current.timeline[0];
      return currentDuration < shortestDuration ? current : shortest;
    });

    if (prioritizedProduct && sidebarRef.current) {
      const uniqueKey = `${prioritizedProduct.brand}-${prioritizedProduct.product_name}-${prioritizedProduct.timeline[0]}-${prioritizedProduct.timeline[1]}`;

      // Only scroll if the active product has changed
      if (lastActiveProductRef.current !== uniqueKey) {
        lastActiveProductRef.current = uniqueKey;
        const productElement = productRefs.current[uniqueKey];

        if (productElement) {
          productElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }
    }
  }, [currentTime, products]);

  // Auto-scroll to highlighted product when it changes
  useEffect(() => {
    if (highlightedProduct && sidebarRef.current) {
      const uniqueKey = `${highlightedProduct.brand}-${highlightedProduct.product_name}-${highlightedProduct.timeline[0]}-${highlightedProduct.timeline[1]}`;
      const productElement = productRefs.current[uniqueKey];

      if (productElement) {
        // Reset user scrolling flag to allow auto-scroll
        isUserScrollingRef.current = false;

        productElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  }, [highlightedProduct]);

  if (isLoading) {
    return (
      <div className="bg-gray-200 border border-gray-300 rounded-[32px] p-4 h-full product-sidebar">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Detecting products...</p>
          </div>
          <p className="text-sm text-gray-500 text-center">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 border border-gray-300 rounded-[32px] h-full product-sidebar flex flex-col overflow-hidden">
      <div
        ref={sidebarRef}
        className="overflow-y-auto p-4 flex-1"
      >
      {products.map((product, index) => {
        const uniqueKey = `${product.brand}-${product.product_name}-${product.timeline[0]}-${product.timeline[1]}`;
        const isCollapsed = collapsedProducts[uniqueKey];
        const reactKey = `product-${index}`;

        const isActive = currentTime >= product.timeline[0] && currentTime <= product.timeline[1];
        const isManuallyToggled = manualToggled[uniqueKey];
        const shouldEnableShopButton = isActive;
        const isHighlighted = highlightedProduct &&
          highlightedProduct.brand === product.brand &&
          highlightedProduct.product_name === product.product_name &&
          highlightedProduct.timeline[0] === product.timeline[0] &&
          highlightedProduct.timeline[1] === product.timeline[1];

        return (
          <div
            key={reactKey}
            className={`mb-6 transition-all duration-300 ${
              isHighlighted ? 'rounded-2xl shadow-lg'
                : ''
            }`}
            ref={(el) => {
              productRefs.current[uniqueKey] = el;
            }}
          >
            {isCollapsed ? (
              <div className="flex items-center gap-4">
                <div
                  className={`px-1 py-0.5 rounded-md text-xs font-normal whitespace-nowrap cursor-pointer ${
                    isActive ? 'text-black border border-black' : 'text-gray-600 border border-gray-600'
                  }`}
                  onClick={() => onProductClick?.(product)}
                >
                  {Math.floor(product.timeline[0] / 60)}:{(Math.floor(product.timeline[0]) % 60).toString().padStart(2, '0')} - {Math.floor(product.timeline[1] / 60)}:{(Math.floor(product.timeline[1]) % 60).toString().padStart(2, '0')}
                </div>
                <span
                  className={`text-base font-normal truncate flex-1 cursor-pointer text-gray-600`}
                  onClick={() => onProductClick?.(product)}
                  title={product.product_name}
                >
                  {product.product_name}
                </span>
                <button
                  className={`flex-shrink-0 ${isActive ? 'text-gray-600 cursor-not-allowed' : 'text-gray-600'}`}
                  onClick={() => {
                    if (!isActive) {
                      onToggleCollapse(product.product_name, product.brand, product.timeline);
                    }
                  }}
                  disabled={isActive}
                  aria-label="펼치기"
                >
                  <KeyboardArrowDown />
                </button>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                        className={`px-1 py-0.5 rounded-md text-xs font-normal whitespace-nowrap cursor-pointer ${
                          isActive ? 'text-black border border-black' : 'text-gray-600 border border-gray-600'}`}
                  onClick={() => onProductClick?.(product)}
                >
                      {Math.floor(product.timeline[0] / 60)}:{(Math.floor(product.timeline[0]) % 60).toString().padStart(2, '0')} - {Math.floor(product.timeline[1] / 60)}:{(Math.floor(product.timeline[1]) % 60).toString().padStart(2, '0')}
                    </div>
                    <h2 className={`text-base font-bold truncate flex-1 cursor-pointer text-gray-600`}
                      onClick={() => onProductClick?.(product)}
                      title={product.product_name}
                    >
                      {product.product_name}
                    </h2>
                  </div>
                  <button
                      className={`flex-shrink-0 ${isActive ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'}`}
                    onClick={() => {
                      if (!isActive) {
                        onToggleCollapse(product.product_name, product.brand, product.timeline);
                      }
                    }}
                    disabled={isActive}
                    aria-label="접기"
                  >
                    <KeyboardArrowUp />
                  </button>
                </div>
                <div className="mb-4">
                  {product.price &&
                   product.price.toLowerCase() !== 'unknown' &&
                   product.price.toLowerCase() !== 'not provided in the video' &&
                   product.price.toLowerCase() !== 'not specified' &&
                   product.price.toLowerCase() !== 'not mentioned in the video' &&
                   product.price.toLowerCase() !== 'not available' &&
                   product.price.toLowerCase() !== 'none' &&
                   product.price.toLowerCase() !== 'none visible' &&
                   product.price.toLowerCase() !== 'not explicitly visible' &&
                   product.price.trim() !== '' && (
                    <div className="mb-2">
                      <span className={`text-gray-600`}>Price: </span>
                      <span className={`font-semibold text-gray-600`}>{product.price}</span>
                    </div>
                  )}
                  {product.brand &&
                   product.brand.toLowerCase() !== 'unknown' &&
                   product.brand.toLowerCase() !== 'not provided in the video' &&
                   product.brand.toLowerCase() !== 'not specified' &&
                   product.brand.toLowerCase() !== 'not mentioned in the video' &&
                   product.brand.toLowerCase() !== 'not available' &&
                   product.brand.toLowerCase() !== 'none' &&
                   product.brand.toLowerCase() !== 'none visible' &&
                   product.brand.toLowerCase() !== 'unbranded' &&
                   product.brand.toLowerCase() !== 'not explicitly visible' &&
                   product.brand.trim() !== '' && (
                    <div className="mb-2">
                      <span className={`text-gray-600`}>Brand: </span>
                      <span className={`text-gray-600`}>{product.brand}</span>
                    </div>
                  )}
                </div>
                <p className={`mb-4 text-gray-600`}>{product.description}</p>
                <button
                  className={`w-full py-2 px-4 text-base font-normal rounded-xl transition-colors flex items-center justify-between ${
                    shouldEnableShopButton
                      ? 'bg-global-text hover:bg-opacity-90 text-zinc-100'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (shouldEnableShopButton) {
                      // Define filtered brand terms that should not be included in search
                      const filteredBrandTerms = [
                        'unknown',
                        'not provided in the video',
                        'not specified',
                        'not mentioned in the video',
                        'not available',
                        'none',
                        'none visible',
                        'unbranded',
                        'not explicitly visible'
                      ];

                      // Check if brand should be filtered out
                      const shouldFilterBrand = product.brand &&
                        filteredBrandTerms.includes(product.brand.toLowerCase().trim());

                      // Create search query
                      let searchQuery;
                      if (shouldFilterBrand) {
                        // Use only product name if brand is filtered
                        searchQuery = product.product_name;
                      } else {
                        // Use brand + product name if brand is valid
                        searchQuery = `${product.brand} ${product.product_name}`;
                      }

                      const q = encodeURIComponent(searchQuery);
                      window.open(`https://www.amazon.com/s?k=${q}`, '_blank');
                    }
                  }}
                  disabled={!shouldEnableShopButton}
                >
                  Shop at Amazon
                  <ShoppingBagOutlined fontSize="small" />
                </button>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
});

export default ProductDetailSidebar;
