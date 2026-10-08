export type ProductId = 'rigid-box' | 'corrugated' | 'mono-carton' | 'paper-cup' | 'paper-bag';

export interface Option {
  id: string;
  label: string;
  multiplier: number;
  note: string;
}

export type DimKey = 'L' | 'W' | 'H' | 'topDia' | 'botDia';

export interface DimSpec {
  key: DimKey;
  label: string;
  min: number;
  max: number;
  default: number;
}

export type Dims = Record<DimKey, number>;

export interface Product {
  id: ProductId;
  name: string;
  short: string;
  blurb: string;
  useCases: string[];
  materials: Option[];
  finishes: Option[];
  dims: DimSpec[];
  basePrice: number;
  /** ₹ per 1000 mm² of printed board at quantity 1 */
  areaRate: number;
}

/** Which mesh + BoxGeometry face a panel is printed onto in the 3D preview. */
export type FaceKey = 'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz';
export interface FaceTarget {
  mesh: 'body' | 'lid' | 'flapFront' | 'flapRight' | 'flapBack' | 'flapLeft' | 'cup';
  face?: FaceKey;
}

export interface Panel {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'print' | 'flap' | 'glue';
  target?: FaceTarget;
}

export interface SectorShape {
  cx: number;
  cy: number;
  R: number;
  r: number;
  theta: number;
}

export interface Dieline {
  productId: ProductId;
  width: number;
  height: number;
  panels: Panel[];
  sector?: SectorShape;
}

export interface Artwork {
  src: string;
  /** offset from centred position, in mm */
  offsetX: number;
  offsetY: number;
  /** 1 = cover/contain-fit the region */
  scale: number;
  fit: 'cover' | 'contain';
}

export interface Design {
  productId: ProductId;
  dims: Dims;
  materialId: string;
  finishId: string;
  /** background artwork spanning the whole dieline */
  whole?: Artwork;
  /** overlays clipped to individual panels, keyed by panel id */
  perPanel: Record<string, Artwork>;
  bgColor: string;
}

export interface CartItem {
  id: string;
  productId: ProductId;
  dims: Dims;
  materialId: string;
  finishId: string;
  qty: number;
  freeSample: boolean;
  thumbnail?: string;
  hasArtwork: boolean;
}

export type OrderStatus =
  | 'placed'
  | 'artwork_approved'
  | 'printing'
  | 'die_cutting'
  | 'qc'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered';

export interface StatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
  city?: string;
}

export interface Shipment {
  kind: 'main' | 'sample';
  awb: string;
  status: OrderStatus;
  events: StatusEvent[];
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  pincode: string;
}

export interface OrderLine extends CartItem {
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: Customer;
  items: OrderLine[];
  subtotal: number;
  shipping: number;
  gst: number;
  total: number;
  paymentRef: string;
  shipments: Shipment[];
}

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  designation: string;
  company: string;
  address: string;
  email: string;
  phone: string;
  productInterest: ProductId[];
  monthlyQty: string;
  message: string;
  source: 'quote' | 'starter-kit';
}
