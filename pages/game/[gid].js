import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { METHOD_TYPE } from "@/store/type";

import Head from "@/components/common/head";
import { GameNavbar } from "@/components/navbar/index";
import Icon from "@/components/common/icon";
import { mahjongSeatImg } from "@/components/common/mahjongimg";
import { emojiImg } from "@/components/common/emoji";
import {
  openModel,
  ReseatModel,
  HistoryModel,
  ReviewModel,
  FanCalModel
} from "@/components/model/index";

import { useGame } from "@/hooks/game";

const FanTag = ({ fan, t }) => (
  <span className={fan < 0 ? "text-red-500" : "text-green-500"}>
    {t(`game:label-${fan < 0 ? "lose" : "win"}-fan`, { fan: Math.abs(fan) })}
  </span>
);

const PlayerItem = ({
  game,
  t,
  idx,
  host,
  hostCount,
  seat,
  players,
  requestUpdateRound
}) => {
  const _player = players.find((p) => p.id === seat[idx]);
  const _fanCalEatModel = React.useRef();
  const _fanCalSelfModel = React.useRef();

  const _onEatClickHandler = (who) => {};

  const _onSelfClickHandler = () => {};

  const _onBounsClickHandler = (type) => {};

  return (
    <div key={idx} className="card card-side bg-base-100 shadow-xl">
      <figure>
        {host === idx ? (
          <div className="indicator">
            <span className="indicator-item badge badge-secondary">
              {hostCount}
            </span>
            <img src={mahjongSeatImg(idx)} alt={`Seat${idx}`} />
          </div>
        ) : (
          <img src={mahjongSeatImg(idx)} alt={`Seat${idx}`} />
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          <Icon src={emojiImg(_player)} name={_player.name} size="h-6 w-6" />
          {_player.name}
          <FanTag fan={_player.total} t={t} />
        </h2>
        <div className="card-actions justify-end">
          <div className="dropdown dropdown-end">
            <label tabIndex={idx + 1} className="btn btn-link btn-sm">
              {t("game:btn-eat")}
            </label>
            <ul
              tabIndex={idx + 1}
              className="p-2 shadow menu dropdown-content rounded-box w-52"
            >
              {seat
                .filter((pid) => _player.id !== pid)
                .map((pid) => (
                  <li key={pid}>
                    <button
                      className="btn btn-sm btn-link"
                      onClick={() => _onEatClickHandler(pid)}
                    >
                      {players.find((p) => p.id === pid).name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
          <button className="btn btn-link btn-sm" onClick={_onSelfClickHandler}>
            {t("game:btn-self")}
          </button>
          <div className="dropdown dropdown-end">
            <label tabIndex={idx + 2} className="btn btn-link btn-sm">
              {t("game:btn-bouns")}
            </label>
            <ul
              tabIndex={idx + 2}
              className="p-2 shadow menu dropdown-content rounded-box w-52"
            >
              {Object.values(METHOD_TYPE)
                .filter((type) => type.includes("bouns_"))
                .map((type) => (
                  <li key={type}>
                    <button
                      className="btn btn-sm btn-link"
                      onClick={() => _onBounsClickHandler(type)}
                    >
                      {t(`game:btn-${type}`)}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const GameIndexPage = ({ gid }) => {
  const _router = useRouter();
  const { t } = useTranslation(["app", "theme", "game"]);
  const {
    game: _gameInfo,
    players: _gamePlayers,
    rounds: _gameRounds,
    actions: _gameActions,
    connectionStatus: _connectionStatus,
    requestRound: _requestRound,
    requestUpdateRound: _requestUpdateRound,
    requestNextRound: _requestNextRound,
    requestPrevRound: _requestPrevRound,
    requestUpdatePlayer: _requestUpdatePlayer,
    requestUpdateGame: _requestUpdateGame,
    requestLeaveGame: _requestLeaveGame
  } = useGame(gid);

  const _reseatModelRef = React.useRef();
  const _reviewModelRef = React.useRef();
  const _historyModelRef = React.useRef();

  return (
    <React.Fragment>
      <Head name={t("app:app-name")} title={t("game:title")} />
      <GameNavbar
        connectionStatus={_connectionStatus}
        title={_gameInfo.name}
        t={t}
        menu={[
          {
            name: "rename",
            onClick: () => {}
          },
          {
            name: "invite",
            onClick: () =>
              window.open(
                `whatsapp://send?text=${window.location.href}`,
                "__blank"
              )
          },
          { name: "reseat", onClick: () => openModel(_reseatModelRef, true) },
          { name: "review", onClick: () => openModel(_reviewModelRef, true) },
          { name: "history", onClick: () => openModel(_historyModelRef, true) },
          { name: "leave", onClick: _requestLeaveGame }
        ]}
      />
      {_gameRounds.seat.length !== 4 ? (
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title">{t("game:not-enough-player")}</h2>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={() => true}>
                {t("game:btn-invite")}
              </button>
            </div>
          </div>
        </div>
      ) : _gamePlayers.length < 4 ? (
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{t("game:enough-player")}</h2>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={() => true}>
                {t("game:btn-reseat")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      <ReseatModel
        ref={_reseatModelRef}
        t={t}
        seat={_gameRounds.seat}
        players={_gamePlayers}
        requestRoundUpdate={_requestUpdateRound}
        onCloseHandler={() => openModel(_reseatModelRef, false)}
      />
      <ReviewModel
        ref={_reviewModelRef}
        t={t}
        game={_gameInfo}
        players={_gamePlayers}
        onCloseHandler={() => openModel(_reviewModelRef, false)}
      />
      <HistoryModel
        ref={_historyModelRef}
        t={t}
        actions={_gameActions}
        players={_gamePlayers}
        onCloseHandler={() => openModel(_reviewModelRef, false)}
      />
    </React.Fragment>
  );
};

export async function getServerSideProps({ query, locale }) {
  const { gid = "" } = query;
  if (gid.length === 0) {
    return {
      redirect: {
        destination: "/",
        permanent: false
      }
    };
  }

  return {
    props: {
      gid,
      ...(await serverSideTranslations(locale, ["app", "theme", "game"]))
    }
  };
}

export default GameIndexPage;
