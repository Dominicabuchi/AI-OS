export interface SelectorInfo {
  selector: string;
  count: number;
}

export interface SelectorReport {
  buttons: SelectorInfo[];
  inputs: SelectorInfo[];
  links: SelectorInfo[];
  forms: SelectorInfo[];
  tables: SelectorInfo[];
  dialogs: SelectorInfo[];
  lists: SelectorInfo[];
  headings: SelectorInfo[];
  contenteditable: SelectorInfo[];
  ariaRoles: SelectorInfo[];
}

export interface CaptureResult {
  directory: string;
  files: string[];
}

export interface SelectorResult {
  exists: boolean;
  visible: boolean;
  count: number;
  html?: string;
}
