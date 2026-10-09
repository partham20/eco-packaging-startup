import type { ShotKind, ToneName } from '../components/PackShot';
import type { ProductId } from '../types';

export interface CatalogItem {
  title: string;
  product: ProductId;
  style: string;
  kind: ShotKind;
  tone: ToneName;
  /** card backdrop, like a product photo background */
  bg: string;
}

export interface CatalogSection {
  id: string;
  title: string;
  items: CatalogItem[];
}

/** Storefront shelves on the home page; every card opens that style in the design studio. */
export const CATALOG: CatalogSection[] = [
  {
    id: 'product-packaging',
    title: 'Product Packaging',
    items: [
      { title: 'Tuck-End Carton', product: 'mono-carton', style: 'straight-tuck', kind: 'tuck', tone: 'white', bg: 'linear-gradient(160deg,#5FB7B2,#2F8F8A)' },
      { title: 'Hanging Box', product: 'mono-carton', style: 'hang-tab', kind: 'tuck', tone: 'espresso', bg: 'linear-gradient(160deg,#D9D9D9,#B9B9B9)' },
      { title: 'Cosmetic / Beauty Brand Box', product: 'mono-carton', style: 'straight-tuck', kind: 'tuck', tone: 'blush', bg: 'linear-gradient(160deg,#F7D6D3,#EDB6B0)' },
      { title: 'Open-Ended Sleeve', product: 'mono-carton', style: 'sleeve', kind: 'drawer', tone: 'cream', bg: 'linear-gradient(160deg,#E4E4E0,#A9AAA6)' },
      { title: 'Drawer Carton', product: 'mono-carton', style: 'tray-sleeve', kind: 'drawer', tone: 'sage', bg: 'linear-gradient(160deg,#EAF0E4,#BFD0B6)' },
    ],
  },
  {
    id: 'rigid',
    title: 'Premium Rigid Boxes',
    items: [
      { title: 'Lid & Base Rigid Box', product: 'rigid-box', style: 'lid-base', kind: 'rigid', tone: 'blush', bg: 'linear-gradient(160deg,#F6E9E4,#E9CFC6)' },
      { title: 'Magnetic Closure Box', product: 'rigid-box', style: 'magnetic', kind: 'magnetic', tone: 'espresso', bg: 'linear-gradient(160deg,#CFCFCB,#9E9E99)' },
      { title: 'Drawer / Sleeve Box', product: 'rigid-box', style: 'drawer', kind: 'drawer', tone: 'white', bg: 'linear-gradient(160deg,#2D4A3E,#1B2E26)' },
      { title: 'Collapsible Gift Box', product: 'rigid-box', style: 'collapsible', kind: 'rigid', tone: 'sage', bg: 'linear-gradient(160deg,#F3EFE6,#DCD3C2)' },
      { title: 'Custom Opening Box', product: 'rigid-box', style: 'custom', kind: 'rigid', tone: 'terracotta', bg: 'linear-gradient(160deg,#F7E6CF,#E9C99E)' },
    ],
  },
  {
    id: 'e-commerce',
    title: 'E-Commerce',
    items: [
      { title: 'D2C Mailer Box', product: 'corrugated', style: 'mailer', kind: 'mailer', tone: 'kraft', bg: 'linear-gradient(160deg,#ECE7DE,#CFC4B2)' },
      { title: 'Shipping Carton', product: 'corrugated', style: 'rsc', kind: 'shipper', tone: 'kraft', bg: 'linear-gradient(160deg,#D8D8D3,#B4B4AE)' },
      { title: 'Telescopic Lid & Base', product: 'corrugated', style: 'telescopic', kind: 'rigid', tone: 'white', bg: 'linear-gradient(160deg,#5E3B4F,#3A2231)' },
      { title: 'Branded Mailer (Printed Inside)', product: 'corrugated', style: 'mailer', kind: 'mailer', tone: 'terracotta', bg: 'linear-gradient(160deg,#FBE3C9,#F3BE8A)' },
    ],
  },
  {
    id: 'bags',
    title: 'Paper Bags',
    items: [
      { title: 'Custom Branded Rope Bag', product: 'paper-bag', style: 'rope', kind: 'bag', tone: 'espresso', bg: 'linear-gradient(160deg,#C9A27A,#8E6B48)' },
      { title: 'Twisted Handle Bag', product: 'paper-bag', style: 'twisted', kind: 'bag', tone: 'kraft', bg: 'linear-gradient(160deg,#EFEFEA,#CFCFC8)' },
      { title: 'Flat Handle Bag', product: 'paper-bag', style: 'flat', kind: 'bag', tone: 'sage', bg: 'linear-gradient(160deg,#F2E9DB,#DCCAA8)' },
      { title: 'Die-Cut Handle Bag', product: 'paper-bag', style: 'die-cut', kind: 'bag', tone: 'white', bg: 'linear-gradient(160deg,#2E6B53,#1D4736)' },
      { title: 'Open-Mouth Food Bag', product: 'paper-bag', style: 'sos', kind: 'bag', tone: 'cream', bg: 'linear-gradient(160deg,#F4E6D7,#E3C3A1)' },
    ],
  },
  {
    id: 'food',
    title: 'Food & Beverage Packaging',
    items: [
      { title: 'Hot Cup (Open Top)', product: 'paper-cup', style: 'hot', kind: 'cup', tone: 'white', bg: 'linear-gradient(160deg,#3B2A22,#20160F)' },
      { title: 'Hot Cup with Sip Lid', product: 'paper-cup', style: 'sip-lid', kind: 'cup', tone: 'kraft', bg: 'linear-gradient(160deg,#E7E7E2,#BDBDB7)' },
      { title: 'Cold Cup, Dome Lid', product: 'paper-cup', style: 'cold-dome', kind: 'cup', tone: 'blush', bg: 'linear-gradient(160deg,#FCE7A8,#F2C94C)' },
      { title: 'Ripple-Wall Cup', product: 'paper-cup', style: 'ripple', kind: 'cup', tone: 'espresso', bg: 'linear-gradient(160deg,#D8E7D1,#9FC08F)' },
      { title: 'Sweet Box', product: 'mono-carton', style: 'straight-tuck', kind: 'tuck', tone: 'terracotta', bg: 'linear-gradient(160deg,#F6D9B0,#E2A957)' },
    ],
  },
];

export const ALL_ITEMS = CATALOG.flatMap((s) => s.items.map((i) => ({ ...i, section: s.title })));
