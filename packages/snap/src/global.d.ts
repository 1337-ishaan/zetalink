import type { SnapElement } from '@metamask/snaps-sdk/jsx';

declare global {
  namespace JSX {
    /** Use SnapElement for JSX element type */
    type Element = SnapElement;

    /** Allow any intrinsic Snap JSX elements */
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    /** Specify attribute property for Snap JSX components */
    interface ElementAttributesProperty {
      props: {};
    }

    /** Specify children attribute for Snap JSX components */
    interface ElementChildrenAttribute {
      children: {};
    }
  }
} 