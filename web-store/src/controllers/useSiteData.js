import { useEffect, useState } from 'react';
import { localProducts, storyFallback } from '../data/brandAssets.js';
import { contentModel } from '../models/contentModel.js';
import { productModel } from '../models/productModel.js';

export function useLandingData() {
  const [landing, setLanding] = useState(storyFallback);
  const [products, setProducts] = useState(localProducts);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.allSettled([contentModel.getLanding(), productModel.list({ limit: 12, sort: 'popular' })]).then(([contentResult, productResult]) => {
      if (!alive) return;
      if (contentResult.status === 'fulfilled') setLanding(contentResult.value);
      if (productResult.status === 'fulfilled') {
        setProducts(productResult.value.products);
      } else {
        setIsDemo(true);
      }
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);
  return { landing, products, loading, isDemo };
}

export function useProductListing(params) {
  const [products, setProducts] = useState(localProducts);
  const [meta, setMeta] = useState({ total: localProducts.length, page: 1, limit: 50, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    productModel.list(params).then((result) => {
      if (!alive) return;
      setProducts(result.products);
      setMeta(result.meta);
      setIsDemo(false);
    }).catch(() => {
      if (!alive) return;
      let filtered = [...localProducts];
      if (params?.category && params.category !== 'all') filtered = filtered.filter((item) => item.category === params.category);
      if (params?.isCustomizable === 'true') filtered = filtered.filter((item) => item.isCustomizable);
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter((item) => item.name.toLowerCase().includes(q) || (item.nameEn || '').toLowerCase().includes(q));
      }
      if (params?.sort === 'price_asc') filtered.sort((a, b) => a.basePrice - b.basePrice);
      if (params?.sort === 'price_desc') filtered.sort((a, b) => b.basePrice - a.basePrice);
      setProducts(filtered);
      setMeta({ total: filtered.length, page: 1, limit: 50, totalPages: 1 });
      setIsDemo(true);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [JSON.stringify(params || {})]);
  return { products, meta, loading, isDemo };
}
