import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>TunePath</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            body { background: #FFFFFF; margin: 0; padding: 0; }
            * { box-sizing: border-box; }
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
