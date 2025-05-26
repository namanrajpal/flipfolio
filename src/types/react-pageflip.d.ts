/**
 *  A relaxed definition for react-pageflip.
 *  We re-export the original component but with every prop optional, which
 *  matches the library’s runtime behaviour & the docs you posted.
 */

declare module 'react-pageflip' {
    import * as React from 'react';
  
    // the library ships its own .d.ts – grab the “strict” props from there
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    import type { IProps as StrictProps } from 'react-pageflip/lib/HTMLFlipBook';
  
    type LooseProps = Partial<StrictProps>;
  
    const HTMLFlipBook: React.ForwardRefExoticComponent<
      LooseProps & React.RefAttributes<any>
    >;
  
    export default HTMLFlipBook;
  }
  