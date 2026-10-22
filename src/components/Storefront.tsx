"use client";

import { useMemo, useState } from "react";
import { askAbout } from "@/components/AccessoryCarousel";
import { accessories, accessoryCategories, type AccessoryCategory } from "@/lib/catalog";
import { site } from "@/lib/site";

type Filter = "All" | AccessoryCategory;

function StoreArrow() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 4h9v9M16 4 5 15" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="m13 13 4 4" />
    </svg>
  );
}

export function Storefront() {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const products = useMemo(() => {
    const term = query.trim().toLowerCase();
    return accessories.filter((item) => {
      const inCategory = filter === "All" || item.category === filter;
      const searchable = [item.name, item.category, item.label, item.blurb, ...item.features].join(" ").toLowerCase();
      return inCategory && (!term || searchable.includes(term));
    });
  }, [filter, query]);

  return (
    <>
      <section className="store-hero">
        <div className="store-hero-video" aria-hidden="true">
          <video
            src="/videos/explosion.mp4"
            poster="/images/hero-exploded-poster.jpg"
            muted
            loop
            autoPlay
            playsInline
            preload="none"
          />
        </div>
        <div className="store-hero-copy">
          <p className="kicker">Ultimate GSM Store</p>
          <h1>
            Power your <span>everyday.</span>
          </h1>
          <p className="store-deck">
            A focused Oraimo collection for charging, listening, and staying connected. Curated here; purchased securely from the official Oraimo Ghana store.
          </p>
          <div className="store-hero-actions">
            <a className="btn btn-orange ripple" href="#shop-grid">
              Browse the collection
            </a>
            <a className="store-text-link" href={site.oraimoDealsUrl} target="_blank" rel="noopener noreferrer">
              View official daily deals <StoreArrow />
            </a>
          </div>
          <div className="store-proof" aria-label="Store information">
            <span>Official product pages</span>
            <span>Live Ghana availability</span>
            <span>Checkout at Oraimo</span>
          </div>
        </div>
        <div className="store-hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <img src="/images/store/powernova-l21.png" alt="" width={780} height={780} />
          <span className="store-float float-a">30W</span>
          <span className="store-float float-b">20,000mAh</span>
        </div>
      </section>

      <section className="store-trust" aria-label="How this store works">
        <div>
          <span className="store-index">01</span>
          <p><strong>Choose here</strong><br />Search a compact, phone-first collection.</p>
        </div>
        <div>
          <span className="store-index">02</span>
          <p><strong>Check live details</strong><br />Price, stock, delivery, and color stay current at Oraimo.</p>
        </div>
        <div>
          <span className="store-index">03</span>
          <p><strong>Ask the bench</strong><br />Open chat if you need help matching an accessory to a phone.</p>
        </div>
      </section>

      <section className="store-section" id="shop-grid">
        <div className="store-title-row">
          <div>
            <p className="kicker">Shop the edit</p>
            <h2>Small catalog. Strong picks.</h2>
          </div>
          <p className="store-count" aria-live="polite">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>

        <div className="store-toolbar">
          <label className="store-search">
            <span className="sr-only">Search products</span>
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search power, audio, cables"
            />
          </label>
          <div className="store-filters" role="group" aria-label="Filter by category">
            {accessoryCategories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={filter === category}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {products.length ? (
          <div className="store-grid">
            {products.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className="product-visual">
                  <span className="product-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="product-category">{product.category}</span>
                  <img src={product.image} alt={product.alt} width={720} height={720} loading={index > 1 ? "lazy" : "eager"} />
                </div>
                <div className="product-copy">
                  <p className="product-label">{product.label}</p>
                  <h3>{product.name}</h3>
                  <p className="product-blurb">{product.blurb}</p>
                  <ul className="product-specs">
                    {product.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <div className="product-price-line">
                    <div>
                      <span>Price and stock</span>
                      <strong>Live at Oraimo Ghana</strong>
                    </div>
                    <span className="live-mark">Live</span>
                  </div>
                  <div className="product-actions">
                    <a className="btn btn-orange ripple" href={product.officialHref} target="_blank" rel="noopener noreferrer">
                      Shop official <StoreArrow />
                    </a>
                    <button type="button" className="btn btn-ghost ripple" onClick={() => askAbout(product.name)}>
                      Ask the bench
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="store-empty" role="status">
            <p className="kicker">No match</p>
            <h3>Try a broader search.</h3>
            <p>Clear the text or choose All to see the full collection.</p>
            <button
              type="button"
              className="btn btn-blue ripple"
              onClick={() => {
                setQuery("");
                setFilter("All");
              }}
            >
              Reset the store
            </button>
          </div>
        )}
      </section>

      <section className="deal-banner">
        <div>
          <p className="kicker">Official Oraimo Ghana</p>
          <h2>Looking for the full range?</h2>
          <p>Open the supplied daily-deals store for current campaigns, live prices, colors, delivery terms, and checkout.</p>
        </div>
        <a className="btn btn-orange ripple" href={site.oraimoDealsUrl} target="_blank" rel="noopener noreferrer">
          Open daily deals <StoreArrow />
        </a>
      </section>

      <p className="store-disclosure">
        Ultimate GSM presents this curated storefront for convenience. Product names, images, and specifications link to Oraimo Ghana. Availability, price, payment, delivery, and warranty are confirmed on the official Oraimo Ghana product page at checkout.
      </p>
    </>
  );
}
