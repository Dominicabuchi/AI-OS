export interface ElementNode {

  id: string;

  selector: string;

  tag: string;

  role?: string;

  text?: string;

  ariaLabel?: string;

  placeholder?: string;

  title?: string;

  href?: string;

  dataTestId?: string;

  elementId?: string;

  name?: string;

  type?: string;

  className?: string;

  aria: Record<string, string>;

  visible: boolean;

  enabled: boolean;

  editable: boolean;

  bounds: {

    x: number;

    y: number;

    width: number;

    height: number;

  };

  attributes: Record<string,string>;

}

export interface Snapshot {

  url: string;

  title: string;

  elements: ElementNode[];

}

export interface SearchRequest {

  platform: string;

  page: string;

  action: string;

  description: string;

  role?: string;

  text?: string;

  value?: string;

}

export interface LearnedSelector {

  platform: string;

  page: string;

  action: string;

  description: string;

  selectors: SelectorResult[];

  confidence: number;

  successCount: number;

  failureCount: number;

  lastVerified: string;

}

export interface MemoryStore {

  selectors: LearnedSelector[];

}

export interface SelectorResult {

  selector: string;

  confidence: number;

  role?: string;

  text?: string;

  ariaLabel?: string;

  placeholder?: string;

  dataTestId?: string;

  elementId?: string;

  name?: string;

  type?: string;

  className?: string;

  tag?: string;

}
