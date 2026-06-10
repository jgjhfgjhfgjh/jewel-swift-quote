-- Aggregated brand catalog for public brand surfaces (brand list, landing
-- pages, carousels). One row per raw manufacturer; the frontend folds variants
-- ("GUESS JEWELS" -> "GUESS") via its alias map. SECURITY DEFINER so guests
-- can read it (produkty RLS allows authenticated only).

CREATE OR REPLACE FUNCTION public.get_brand_catalog(p_top_n integer DEFAULT 10)
RETURNS TABLE(
  manufacturer text,
  total bigint,
  watches bigint,
  jewelry bigint,
  in_stock bigint,
  max_discount integer,
  categories text[],
  top_products jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH valid AS (
    SELECT id, manufacturer, category_text, product_name, image_url,
           retail_price, wholesale_price, stock
    FROM produkty
    WHERE manufacturer IS NOT NULL AND TRIM(manufacturer) <> ''
      AND (category_text IS NULL OR LOWER(category_text) NOT LIKE '%dropshipping%')
  ),
  ranked AS (
    SELECT v.*,
           ROW_NUMBER() OVER (
             PARTITION BY v.manufacturer
             ORDER BY (v.stock > 0) DESC,
                      CASE WHEN v.retail_price > 0
                           THEN 1 - v.wholesale_price / v.retail_price
                           ELSE 0 END DESC NULLS LAST
           ) AS rn
    FROM valid v
    WHERE v.image_url IS NOT NULL AND v.image_url <> ''
  )
  SELECT
    v.manufacturer,
    COUNT(*)::bigint AS total,
    COUNT(*) FILTER (WHERE v.category_text ILIKE '%HODINKY%')::bigint AS watches,
    COUNT(*) FILTER (WHERE v.category_text ILIKE '%ŠPERKY%')::bigint AS jewelry,
    COUNT(*) FILTER (WHERE v.stock > 0)::bigint AS in_stock,
    COALESCE(MAX(CASE WHEN v.retail_price > 0
                      THEN ROUND((1 - v.wholesale_price / v.retail_price) * 100)
                 END), 0)::integer AS max_discount,
    (SELECT array_agg(DISTINCT c.category_text)
       FROM valid c
      WHERE c.manufacturer = v.manufacturer AND c.category_text IS NOT NULL) AS categories,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'id', r.id,
               'name', r.product_name,
               'img', r.image_url,
               'price', r.retail_price,
               'wholesale', r.wholesale_price,
               'inStock', r.stock > 0,
               'category', r.category_text
             ) ORDER BY r.rn)
      FROM ranked r
      WHERE r.manufacturer = v.manufacturer AND r.rn <= p_top_n
    ), '[]'::jsonb) AS top_products
  FROM valid v
  GROUP BY v.manufacturer;
$$;

GRANT EXECUTE ON FUNCTION public.get_brand_catalog(integer) TO anon, authenticated;
