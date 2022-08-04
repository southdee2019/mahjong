import React, { useEffect } from "react";

import { mahjongSeatImg } from "@/components/common/mahjongimg";
import { setDisplay, Overlay } from "@/components/common/overlay";

const openModel = (ref, b) => setDisplay(ref, b ? "flex" : "none");

const _ReseatModel = ({
  t,
  seat,
  players,
  requestRoundUpdate,
  onCloseHandler = () => true,
  ref
}) => {
  const [_seats, _setSeats] = React.useState([]);
  useEffect(() => {
    if (players.length >= 4) {
      if (seat.length === 0) {
        const _p = players[0];
        _setSeats([_p.id, _p.id, _p.id, _p.id]);
      } else {
        _setSeats(seat);
      }
    }
  }, [seat, players]);

  return (
    <Overlay ref={ref} onClick={() => onCloseHandler()}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{t("game:btn-reseat")}</h3>
        <div class="divider" />
        {_seats.map((id, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-4">
            <div>
              <img src={mahjongSeatImg(idx)} alt={`Seat${idx}`} />
            </div>
            <div className="col-span-2">
              <div className="form-control">
                <select
                  className="select select-bordered"
                  onChange={(e) =>
                    _setSeats((a) => {
                      const _na = [...a];
                      _na[idx] = e.target.value;
                      return _na;
                    })
                  }
                >
                  {players.map((p) => (
                    <option key={p.id} selected={p.id === id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
        <div className="modal-action">
          {_seats.length === 0 ||
          _seats.filter((id, idx) => _seats.indexOf(id) !== idx).length !==
            0 ? null : (
            <button
              className="btn btn-primary"
              onClick={() => {
                requestRoundUpdate({ seats: _seats });
                onCloseHandler();
              }}
            >
              {t("game:btn-ok")}
            </button>
          )}
          <button
            className="btn btn-ghost"
            onClick={() => {
              onCloseHandler();
            }}
          >
            {t("game:btn-cancel")}
          </button>
        </div>
      </div>
    </Overlay>
  );
};

const ReseatModel = React.forwardRef((props, ref) =>
  _ReseatModel({ ...props, ref })
);
ReseatModel.displayName = "ReseatModel";

const _FanCalModel = ({
  t,
  winner,
  losers,
  host,
  hostCount,
  self,
  requestRoundUpdate,
  ref
}) => {};

const FanCalModel = React.forwardRef((props, ref) =>
  _FanCalModel({ ...props, ref })
);
FanCalModel.displayName = "FanCalModel";

const _HistoryModel = ({ t, players, actions, onCloseHandler, ref }) => {
  const _getPlayerName = (id) => players.find((p) => p.id === id).name;
  return (
    <Overlay ref={ref} onClick={() => onCloseHandler()}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{t("game:btn-history")}</h3>
        <div class="divider" />
        {actions.map((a) => (
          <p>
            {t(`game:record-${a.event}`, {
              createdAt: a.createdAt,
              by: _getPlayerName(a.by),
              args: a.args
            })}
          </p>
        ))}
      </div>
    </Overlay>
  );
};

const HistoryModel = React.forwardRef((props, ref) =>
  _HistoryModel({ ...props, ref })
);
HistoryModel.displayName = "HistoryModel";

const _ReviewModel = ({ t, game, players, onCloseHandler, ref }) => (
  <Overlay ref={ref} onClick={() => onCloseHandler()}>
    <div className="modal-box">
      <h3 className="font-bold text-lg">{t("game:btn-review")}</h3>
      <div class="divider" />
      {players.map((p) => (
        <p className={p.total < 0 ? "text-red-500" : "text-green-500"}>{`${
          p.name
        } ${t(p.total < 0 ? "game:label-lose" : "game:label-win", {
          total: Math.abs(p.total * game.fanRatio)
        })}`}</p>
      ))}
    </div>
  </Overlay>
);

const ReviewModel = React.forwardRef((props, ref) =>
  _ReviewModel({ ...props, ref })
);
ReviewModel.displayName = "ReviewModel";

export { openModel, ReseatModel, ReviewModel, FanCalModel, HistoryModel };
