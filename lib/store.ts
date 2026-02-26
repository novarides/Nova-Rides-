// In-memory JSON store with optional file persistence for MVP.
// Data is saved to data/store.json locally so it survives restarts. On Vercel/Netlify (read-only fs) we fall back to in-memory only; data does not persist across serverless invocations.
import { User, Vehicle, Booking, Review, Message, Transaction } from "./types";
import { v4 as uuid } from "uuid";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "fs";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

export interface Store {
  users: User[];
  vehicles: Vehicle[];
  bookings: Booking[];
  reviews: Review[];
  messages: Message[];
  transactions: Transaction[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

function getDefaultStore(): Store {
  return {
    users: [...defaultUsers],
    vehicles: [...defaultVehicles],
    bookings: [],
    reviews: [],
    messages: [],
    transactions: [],
  };
}

// Default data for demo
const defaultUsers: User[] = [
  {
    id: "user-host-1",
    email: "host@novarides.com",
    phone: "+2348012345678",
    role: "host",
    verified: true,
    identityVerified: true,
    licenseVerified: true,
    hostVerifiedBadge: true,
    firstName: "Chioma",
    lastName: "Okonkwo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    acceptedTerms: true,
    acceptedPrivacy: true,
  },
  {
    id: "user-renter-1",
    email: "renter@novarides.com",
    role: "renter",
    verified: true,
    identityVerified: true,
    licenseVerified: true,
    firstName: "Emeka",
    lastName: "Nwosu",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    acceptedTerms: true,
    acceptedPrivacy: true,
  },
];

const defaultVehicles: Vehicle[] = [
  {
    id: "vehicle-gle63-demo",
    hostId: "user-host-1",
    title: "Mercedes AMG GLE 63S",
    description: "Powerful luxury SUV, perfect for Lagos roads. Full insurance included.",
    year: 2023,
    make: "Mercedes-Benz",
    model: "AMG GLE 63S",
    mileage: 12000,
    vehicleClass: "luxury",
    pricePerDay: 150000,
    pricePerWeek: 900000,
    currency: "NGN",
    images: ["/cars/gle63.jpg"],
    location: { city: "Lagos", lat: 6.5244, lng: 3.3792 },
    availability: ["2026-02-24", "2026-02-25", "2026-02-26", "2026-02-27", "2026-02-28"],
    minRentalDays: 1,
    bookingType: "instant",
    featured: true,
    promoted: true,
    rating: 4.9,
    reviewCount: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "active",
  },
  {
    id: "vehicle-camry-demo",
    hostId: "user-host-1",
    title: "Toyota Camry 2024",
    description: "Reliable and fuel-efficient sedan for daily use.",
    year: 2024,
    make: "Toyota",
    model: "Camry",
    mileage: 5000,
    vehicleClass: "midsize",
    pricePerDay: 45000,
    pricePerWeek: 270000,
    currency: "NGN",
    images: ["/cars/camry.jpg"],
    location: { city: "Lagos", lat: 6.4541, lng: 3.3947 },
    availability: ["2026-02-24", "2026-02-25", "2026-02-26", "2026-03-01", "2026-03-02"],
    minRentalDays: 2,
    bookingType: "approval",
    featured: false,
    promoted: false,
    rating: 4.7,
    reviewCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "active",
  },
];

let store: Store = {
  users: defaultUsers,
  vehicles: defaultVehicles,
  bookings: [],
  reviews: [],
  messages: [],
  transactions: [],
};

let storeLoaded = false;

function loadStoreSync(): void {
  if (storeLoaded) return;
  storeLoaded = true;
  try {
    if (existsSync(STORE_FILE)) {
      const raw = readFileSync(STORE_FILE, "utf-8");
      const data = JSON.parse(raw) as Store;
      if (Array.isArray(data.users)) store.users = data.users;
      if (Array.isArray(data.vehicles)) store.vehicles = data.vehicles;
      if (Array.isArray(data.bookings)) store.bookings = data.bookings;
      if (Array.isArray(data.reviews)) store.reviews = data.reviews;
      if (Array.isArray(data.messages)) store.messages = data.messages;
      if (Array.isArray(data.transactions)) store.transactions = data.transactions;
    }
  } catch {
    // File missing or invalid: keep defaults
  }
}

/** Persist store to data/store.json. No-op on Vercel/Netlify (read-only fs). */
export function persistStore(): void {
  loadStoreSync();
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // e.g. read-only filesystem: ignore
  }
}

export function getStore(): Store {
  loadStoreSync();
  return store;
}

export function setStore(newStore: Store): void {
  store = newStore;
}

export function generateId(): string {
  return uuid();
}
