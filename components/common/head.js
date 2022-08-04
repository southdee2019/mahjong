import React from "react";
import Head from "next/head";

const AppHead = ({ name, title, description = false, keywords = false }) => {
  return (
    <Head>
      <title>
        {name} - {title}
      </title>
      <meta charSet="UTF-8" />
      {description ? <meta name="description" content={description} /> : null}
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="author" content={process.env.APP_AUTHOR} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
  );
};

export default AppHead;
