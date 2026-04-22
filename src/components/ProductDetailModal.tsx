import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/lib/types';

interface Param {
  nazev: string;
  hodnota: string;
}

interface ProductDetailModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const [params, setParams] = useState<Param[]>([]);
  const [paramsLoading, setParamsLoading] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const images = product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : product.img ? [product.img] : [];

  useEffect(() => {
    if (!open) return;
    setGalleryIndex(0);
    setParamsLoading(true);

    (supabase as any)
      .from('produkty_parametry')
      .select('nazev, hodnota')
      .eq('produkt_id', product.id)
      .then(({ data }: { data: Param[] | null }) => {
        setParams(data ?? []);
        setParamsLoading(false);
      });
  }, [open, product.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && images.length > 1) setGalleryIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft' && images.length > 1) setGalleryIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, images.length]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[15000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-gray-700 hover:bg-black/10 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image gallery */}
          <div className="relative bg-gray-50 rounded-tl-xl rounded-bl-xl flex items-center justify-center min-h-64 p-6">
            {images.length > 0 ? (
              <>
                <img
                  src={images[galleryIndex]}
                  alt={product.name}
                  className="max-h-72 max-w-full object-contain select-none"
                  draggable={false}
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setGalleryIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryIndex((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    {/* Thumbnail strip */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-x-auto">
                      {images.map((src, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setGalleryIndex(i)}
                          className={`flex-shrink-0 h-10 w-10 rounded border-2 overflow-hidden transition ${
                            i === galleryIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={src} alt="" className="h-full w-full object-contain" draggable={false} />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-muted-foreground text-sm">Bez obrázku</div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-gold mb-1">{product.manufacturer}</p>
              <h2 className="text-lg font-semibold leading-snug">{product.name}</h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>SKU: <span className="font-medium text-foreground">{product.sku}</span></span>
              {product.ean && <span>EAN: <span className="font-medium text-foreground">{product.ean}</span></span>}
            </div>

            {product.short_description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.short_description}</p>
            )}

            {product.description && (
              <div
                className="text-sm leading-relaxed text-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
          </div>
        </div>

        {/* Parameters */}
        {(paramsLoading || params.length > 0) && (
          <div className="border-t px-6 py-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Parametry</h3>
            {paramsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                {params.map((p, i) => (
                  <div key={i} className="flex justify-between border-b border-gray-50 py-1 text-sm">
                    <span className="text-muted-foreground">{p.nazev}</span>
                    <span className="font-medium text-right ml-4">{p.hodnota}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
