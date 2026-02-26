/**
 * AI-style pricing recommendation for vehicle listings.
 * Uses a smart heuristic by default; optional OpenAI for richer suggestions.
 */

const BASE_PRICE_NGN: Record<string, number> = {
  economy: 15_000,
  compact: 20_000,
  midsize: 25_000,
  fullsize: 35_000,
  luxury: 55_000,
  suv: 40_000,
  van: 35_000,
  sports: 60_000,
  electric: 45_000,
};

const YEAR_BASELINE = 2020;
const YEAR_FACTOR_PER_YEAR = 0.03; // +3% per year newer, -3% per year older
const PREMIUM_CITIES = ["lagos", "abuja", "port harcourt", "ibadan"];
const CITY_PREMIUM = 1.1; // 10% for major cities

export interface RecommendPriceInput {
  make: string;
  model: string;
  year: number;
  vehicleClass: string;
  city?: string;
  currency?: string;
}

export interface RecommendPriceResult {
  recommendedPricePerDay: number;
  reasoning: string;
  currency: string;
}

function heuristicRecommend(input: RecommendPriceInput): RecommendPriceResult {
  const currency = (input.currency || "NGN").toUpperCase();
  const classKey = input.vehicleClass?.toLowerCase() || "midsize";
  let base = BASE_PRICE_NGN[classKey] ?? BASE_PRICE_NGN.midsize;

  // Year adjustment (newer = higher, older = lower)
  const yearDiff = (input.year || YEAR_BASELINE) - YEAR_BASELINE;
  const yearFactor = 1 + yearDiff * YEAR_FACTOR_PER_YEAR;
  base = Math.round(base * yearFactor);

  // City premium (Lagos, Abuja, etc.)
  const city = (input.city || "").trim().toLowerCase();
  if (PREMIUM_CITIES.some((c) => city.includes(c))) {
    base = Math.round(base * CITY_PREMIUM);
  }

  // Floor and reasonable cap (NGN)
  base = Math.max(5_000, Math.min(500_000, base));

  const parts: string[] = [];
  parts.push(`Based on ${input.vehicleClass || "vehicle"} class`);
  if (input.year) parts.push(`and ${input.year} model year`);
  if (input.make) parts.push(`${input.make}${input.model ? ` ${input.model}` : ""}`);
  if (city && PREMIUM_CITIES.some((c) => city.includes(c))) parts.push("; includes a small premium for your city");
  parts.push(".");

  return {
    recommendedPricePerDay: base,
    reasoning: parts.join(" "),
    currency,
  };
}

/** Currency-specific sane ranges for daily rental (min–max per day). */
const PRICE_RANGES: Record<string, [number, number]> = {
  NGN: [3_000, 3_000_000],
  USD: [25, 1_500],
  EUR: [25, 1_400],
  GBP: [20, 1_200],
};

function getPriceRange(currency: string): [number, number] {
  const key = (currency || "NGN").toUpperCase();
  return PRICE_RANGES[key] ?? PRICE_RANGES.NGN;
}

/** Call OpenAI for a suggested price using worldwide average rates (optional). */
async function openAIRecommend(input: RecommendPriceInput): Promise<RecommendPriceResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const currency = (input.currency || "NGN").toUpperCase();
  const city = (input.city || "").trim() || "not specified";

  const prompt = `You are a car rental pricing expert with knowledge of peer-to-peer and traditional rental rates worldwide (US, Europe, UK, Asia, Africa, Latin America). Use average daily rates from major markets to suggest a fair price.

Task: Given the vehicle and host location, suggest a daily rental price in ${currency} that aligns with worldwide average rates for this vehicle class, age, and make/model. Adjust for the host's city/country so the price is competitive in their local market while reflecting global benchmarks.

Reply with ONLY a valid JSON object, no other text or markdown:
{"pricePerDay": number, "reasoning": string}

- pricePerDay: daily rate in ${currency} (number only).
- reasoning: one or two short sentences mentioning worldwide average rates and the host's market (e.g. "Based on global P2P rental averages for this class and year; adjusted for [city] market.").

Vehicle: ${input.year || "?"} ${input.make || ""} ${input.model || ""}, class: ${input.vehicleClass || "midsize"}, city: ${city}. Currency: ${currency}.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 180,
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return null;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;
    const parsed = JSON.parse(start >= 0 && end > start ? text.slice(start, end) : text);
    const price = Math.round(Number(parsed.pricePerDay) || 0);
    const [minP, maxP] = getPriceRange(currency);
    if (price < minP || price > maxP) return null;
    return {
      recommendedPricePerDay: price,
      reasoning: String(parsed.reasoning || "Based on worldwide average rental rates for this vehicle and market."),
      currency,
    };
  } catch {
    return null;
  }
}

/**
 * Get a recommended price per day for a vehicle.
 * Tries OpenAI if OPENAI_API_KEY is set; otherwise uses heuristic.
 */
export async function getRecommendedPrice(input: RecommendPriceInput): Promise<RecommendPriceResult> {
  const ai = await openAIRecommend(input);
  if (ai) return ai;
  return heuristicRecommend(input);
}
