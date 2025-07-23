import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Pinyon+Script&family=Prata&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Elsie:wght@400;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <div id="modal-root"></div>
        <NextScript />
      </body>
    </Html>
  );
}
