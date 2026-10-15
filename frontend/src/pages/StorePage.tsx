import { motion } from "motion/react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { Icon } from "../components/Icon";
import { Empty, Page, Pagination, Price, ProductImage, Skeleton } from "../components/Ui";
import { qs } from "../lib/api";
import type { Category, Page as PageOf, ProductCard } from "../lib/types";
import { useApi, useDebounced } from "../lib/useApi";

const SORTS = [
  { value: "featured", label: "Destaques" },
  { value: "newest", label: "Novidades" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
  { value: "name", label: "Nome" }
];

export function StorePage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const query = useDebounced(q, 280);
  const category = params.get("categoria") ?? "";
  const sort = params.get("ordem") ?? "featured";
  const page = Number(params.get("pagina") ?? 0);
  const available = params.get("disponivel") === "1";

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    if (k !== "pagina") next.delete("pagina");
    setParams(next, { replace: true });
  };

  const categories = useApi<Category[]>("/api/catalog/categories");
  const products = useApi<PageOf<ProductCard>>(
    "/api/catalog/products" +
      qs({ q: query, category, sort, page, size: 12, onlyAvailable: available })
  );

  return (
    <Page className="store">
      <section className="store-hero wrap">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          Coisas boas, sem excesso.
        </motion.h1>
        <p className="muted">Objetos para casa, trabalho e pausas. Frete grátis a partir de R$ 299.</p>
      </section>

      <section className="wrap store-toolbar">
        <div className="search">
          <Icon name="search" size={18} />
          <input
            className="input"
            placeholder="Buscar produtos"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              set("q", e.target.value || null);
            }}
            aria-label="Buscar produtos"
          />
        </div>
        <div className="chips" role="group" aria-label="Categorias">
          <button className="chip" aria-pressed={!category} onClick={() => set("categoria", null)}>
            Tudo
          </button>
          {categories.data?.map((c) => (
            <button key={c.id} className="chip" aria-pressed={category === c.slug} onClick={() => set("categoria", c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="row store-toolbar-end">
          <label className="check">
            <input type="checkbox" checked={available} onChange={(e) => set("disponivel", e.target.checked ? "1" : null)} />
            Só disponíveis
          </label>
          <select className="select compact" value={sort} onChange={(e) => set("ordem", e.target.value)} aria-label="Ordenar">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="wrap">
        {products.loading && !products.data ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="stack" style={{ gap: 12 }}>
                <div className="skeleton" style={{ aspectRatio: "1 / 1", borderRadius: 18 }} />
                <Skeleton h={14} w="70%" />
                <Skeleton h={14} w="40%" />
              </div>
            ))}
          </div>
        ) : products.data && products.data.items.length === 0 ? (
          <Empty
            icon="search"
            title="Nada por aqui"
            text="Tente outra busca ou veja todas as categorias."
            action={
              <button
                className="btn ghost"
                onClick={() => {
                  setQ("");
                  setParams(new URLSearchParams(), { replace: true });
                }}
              >
                Limpar filtros
              </button>
            }
          />
        ) : (
          <>
            <motion.div
              key={`${query}|${category}|${sort}|${page}|${available}`}
              className="product-grid"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.035 } } }}
            >
              {products.data?.items.map((p) => <ProductTile key={p.id} p={p} />)}
            </motion.div>
            {products.data && (
              <Pagination page={products.data.page} pages={products.data.pages} total={products.data.total} onPage={(p) => set("pagina", String(p))} />
            )}
          </>
        )}
      </section>
    </Page>
  );
}

function ProductTile({ p }: { p: ProductCard }) {
  const { add } = useCart();
  const out = p.stock <= 0;
  return (
    <motion.article
      className="product-tile"
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } } }}
    >
      <Link to={`/produto/${p.slug}`} className="product-tile-media">
        <ProductImage src={p.imageUrl} alt={p.name} />
        <div className="product-tile-tags">
          {p.compareAtPrice && p.compareAtPrice > p.price && (
            <span className="pill ink">-{Math.round((1 - p.price / p.compareAtPrice) * 100)}%</span>
          )}
          {out ? <span className="pill line">Esgotado</span> : p.stock <= 5 ? <span className="pill line">Últimas {p.stock}</span> : null}
        </div>
      </Link>
      <div className="product-tile-body">
        <div>
          <span className="muted small">{p.category}</span>
          <Link to={`/produto/${p.slug}`} className="product-tile-name">
            {p.name}
          </Link>
          <Price value={p.price} compareAt={p.compareAtPrice} />
        </div>
        <button className="add-button" disabled={out} onClick={() => add(p.id, 1, p.name)} aria-label={`Adicionar ${p.name} ao carrinho`}>
          <Icon name="plus" size={18} />
        </button>
      </div>
    </motion.article>
  );
}
