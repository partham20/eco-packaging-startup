export type ProductId = 'rigid-box' | 'corrugated' | 'mono-carton' | 'paper-cup' | 'paper-bag';

export interface Option {
  id: string;
  label: string;
  multiplier: number;
  note: string;
}

export type DimKey = 'L' | 'W' | 'H' | 'topDia' | 'botDia';

/** Structural opening style within a product line (lid & base, drawer, magnetic, …). */
export type StyleId = string;

/** A slider in the 3D view that animates the style's opening (lid, drawer, fold, …). */
export interface ViewControl {
  key: 'open' | 'fold';
  label: string;
  /** captions for value 0 and value 1 */
  from: string;
  to: string;
}

export interface ProductStyle {
  id: StyleId;
  name: string;
  blurb: string;
  /** how the style opens / closes, shown on the style chip */
  opening: string;
  /** relative price vs. the product's base style */
  priceFactor: number;
  /** default dimensions for this style (falls back to the product defaults) */
  dims?: Partial<Record<DimKey, number>>;
  controls: ViewControl[];
  /** lets the customer describe the opening style they have in mind */
  freeText?: boolean;
}

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
  styles: ProductStyle[];
  basePrice: number;
  /** ₹ per 1000 mm² of printed board at quantity 1 */
  areaRate: number;
}

/** Which mesh + BoxGeometry face a panel is printed onto in the 3D preview. */
export type FaceKey = 'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz';
export interface FaceTarget {
  mesh: 'body' | 'lid' | 'sleeve' | 'tab' | 'flapFront' | 'flapRight' | 'flapBack' | 'flapLeft' | 'cup';
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

/** Extra outlines drawn on the flat template (handle cut-outs, euro-slots). */
export interface Mark {
  id: string;
  kind: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  label: string;
}

export interface Dieline {
  productId: ProductId;
  styleId: StyleId;
  width: number;
  height: number;
  panels: Panel[];
  marks?: Mark[];
  /** panels that get the sample logo in "try it with my brand name" */
  hero: string[];
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
  styleId: StyleId;
  /** free-text description for "other / custom" opening styles */
  styleNote: string;
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
  /** missing on items saved before opening styles existed → the product's first style */
  styleId?: StyleId;
  styleNote?: string;
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
  source: 'quote' | 'starter-kit' | 'instant-quote';
}

export type RequestStatus = 'new' | 'reviewing' | 'quoted' | 'sample_sent' | 'sample_delivered' | 'closed';

export interface RequestFile {
  name: string;
  type: string;
  size: number;
  /** data URL; may be dropped from older requests if browser storage fills up */
  dataUrl?: string;
  /** 'design' = print-ready render generated from the studio, 'upload' = attached by the customer */
  origin: 'design' | 'upload';
}

export interface RequestSpec {
  productId: ProductId;
  styleId: StyleId;
  styleNote?: string;
  dims: Dims;
  materialId: string;
  finishId: string;
}

export interface RequestEvent {
  at: string;
  status: RequestStatus;
  note: string;
}

export interface QuotationDetail {
  unitPrice: number;
  qty: number;
  total: number;
  leadTimeDays: number;
  validUntil: string;
  note: string;
}

export interface SampleDispatch {
  courier: string;
  awb: string;
  dispatchedAt: string;
  deliveredAt?: string;
  note?: string;
}

/** A quote and/or physical-sample request raised from the design studio. */
export interface QuoteRequest {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    designation: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  spec: RequestSpec;
  qty: number;
  volumeNote: string;
  wantsSample: boolean;
  message: string;
  files: RequestFile[];
  /** small 3D snapshot of the configured pack */
  preview?: string;
  status: RequestStatus;
  quotation?: QuotationDetail;
  sample?: SampleDispatch;
  events: RequestEvent[];
}
