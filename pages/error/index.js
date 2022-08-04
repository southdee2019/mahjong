import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import Alert from "@/components/common/alert";
import Head from "@/components/common/head";
import Panel from "@/components/common/panel";
import { CopyrightFooter } from "@/components/footer/index";

const ErrorIndexPage = ({ message }) => {
  const _router = useRouter();
  const { t } = useTranslation(["app", "error"]);

  return (
    <React.Fragment>
      <Head name={t("app:app-name")} title={t("game:title")} />
      <Panel opacity={100} contentStyle="flex-col justify-center">
        <img
          alt="Game Logo"
          src="/imgs/icon128x128.png"
          width={128}
          height={128}
        />
        <h1 className="mb-2 text-1xl font-bold text-red-600">
          {t("error:content")}
        </h1>
        <Alert
          show={true}
          type="warning"
          message={`${t("error:message")}: ${message}`}
        />
        <button
          className="btn btn-primary w-full"
          onClick={() => _router.replace("/")}
        >
          {t("error:btn-home")}
        </button>
        <CopyrightFooter />
      </Panel>
    </React.Fragment>
  );
};

export async function getServerSideProps({ query, locale }) {
  const { message = "" } = query;
  return {
    props: {
      message,
      ...(await serverSideTranslations(locale, ["app", "error"]))
    }
  };
}

export default ErrorIndexPage;
