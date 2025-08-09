import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <title>Discord Clone</title>
        <meta
          name="description"
          content="Discord Clone with Next.js, React.js, TailWindCSS & TypeScript."
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}