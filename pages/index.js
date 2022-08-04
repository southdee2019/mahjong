import { Fragment, useEffect, useState } from "react";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { useLocalStore } from "@/hooks/localStore";
import { useRequest } from "@/hooks/request";

import Head from "@/components/common/head";
import Panel from "@/components/common/panel";
import { getThemeList, ThemeChanger } from "@/components/common/themeselector";
import { CopyrightFooter } from "@/components/footer/index";

const GameForm = ({ myName, myIdentity, t, router, request }) => {
  const [_myName, _setMyName] = useState(myName());
  const [_gameName, _setGameName] = useState(
    `${myName()}${t("index:label-game-name")}`
  );
  const [_gameBase, _setGameBase] = useState(10);
  const [_gameRatio, _setGameRatio] = useState(1);

  const onGameStartHandler = async () => {
    const { status: _status, data: _data } = await request({
      url: `/api/game`,
      method: "POST",
      data: {
        base: _gameBase,
        fanRatio: _gameRatio,
        name: _gameName,
        creatorName: _myName,
        creatorIdentity: myIdentity()
      }
    });

    if (_status === 200) {
      return router.replace(`/game/${_data.game.id}`);
    }

    return false;
  };

  return (
    <Fragment>
      <div className="form-control">
        <label className="input-group">
          <span>{t("index:label-my-name")}</span>
          <input
            type="text"
            placeholder={t("index:placeholder-my-name")}
            className="input input-bordered"
            value={_myName}
            onChange={(e) => _setMyName(e.target.value)}
            onBlur={(e) => {
              const _s = e.target.value.trim();
              if (_s.length === 0) {
                return _setMyName(myName());
              }

              return myName(_s);
            }}
          />
        </label>
      </div>
      <div className="form-control">
        <label className="input-group">
          <span>{t("index:label-game-name")}</span>
          <input
            type="text"
            placeholder={t("index:placeholder-game-name")}
            className="input input-bordered w-32"
            value={_gameName}
            onChange={(e) => _setGameName(e.target.value)}
            onBlur={(e) => {
              const _s = e.target.value.trim();
              if (_s.length === 0) {
                return _setMyName(`${myName()}${t("index:label-game-name")}`);
              }

              return true;
            }}
          />
          <ThemeChanger
            themeList={getThemeList().reduce(
              (obj, theme) => ({ ...obj, [theme]: t(`theme:theme-${theme}`) }),
              {}
            )}
            height="h-48"
            direction="dropdown-top dropdown-end"
            icon={null}
          />
        </label>
      </div>
      <div className="form-control">
        <label className="input-group">
          <input
            type="number"
            className="input input-bordered w-16"
            value={_gameBase}
            onChange={(e) => _setGameBase(e.target.value)}
            onBlur={(e) => (e.target.value <= 0 ? _setGameBase(10) : true)}
          />
          <span>{t("index:label-game-base")}</span>
          <input
            type="number"
            className="input input-bordered w-16"
            value={_gameRatio}
            onChange={(e) => _setGameRatio(e.target.value)}
            onBlur={(e) => (e.target.value <= 0 ? _setGameRatio(1) : true)}
          />
          <span>{t("index:label-game-fan-ratio")}</span>
        </label>
      </div>
      <div className="form-control">
        <button className="btn btn-primary w-64" onClick={onGameStartHandler}>
          {t("index:btn-start-game")}
        </button>
      </div>
    </Fragment>
  );
};

export default function IndexPage() {
  const _router = useRouter();
  const _request = useRequest();
  const { t } = useTranslation(["app", "theme", "index"]);
  const {
    gidsList: _gidsList,
    identity: _identity,
    name: _name
  } = useLocalStore();

  useEffect(() => {
    const _gids = _gidsList();
    if (_gids.length > 0) {
      _router.replace(`/game/${_gids[0]}`);
    }

    return () => true;
  }, [_router, _gidsList]);

  if (_gidsList().length > 0) {
    return <Panel opacity={100} bgImg="/imgs/splash.png" />;
  }

  return (
    <Fragment>
      <Head
        name={t("app:app-name")}
        description={t("app:app-description")}
        keywords={t("app:app-keywords")}
        title={t("index:title")}
      />
      <Panel opacity={100} contentStyle="flex-col justify-center">
        <img
          alt="Game Logo"
          src="/imgs/icon128x128.png"
          width={128}
          height={128}
        />
        <GameForm
          myName={_name}
          myIdentity={_identity}
          router={_router}
          request={_request}
          t={t}
        />
        <CopyrightFooter />
      </Panel>
    </Fragment>
  );
}

export async function getServerSideProps({ locale, req, res }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["app", "theme", "index"])),
      locale
    }
  };
}
