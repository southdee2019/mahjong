import { Base } from "@/store/base";
import { METHOD_TYPE } from "@/store/type";
import { getRoundsDb } from "@/db";

export const Rounds = (gid) => {
  return class Round extends Base {
    updateResult(who, type, others = {}, idx = -1) {
      // @params who    - who is the winner/loser
      // @params type   - which winning ?
      // @params other  - { id: fan }
      // @params idx    - -1 => new item, others => existing items

      const [_tail, _sum] = Object.entries(others).reduce(
        ([txt, sum], [id, fan]) => [`${txt},${id}@${fan}`, sum + fan],
        ["", 0]
      );
      const _inst = `${type}?${who}@${_sum}${_tail}`;
      if (idx < 0 || idx >= this._props["result"].length) {
        this._props["result"] = [...this._props["result"], _inst];
      } else {
        this._props["result"][idx] = _inst;
      }

      return this;
    }

    removeResult(idx) {
      this._props["result"].splice(idx, 1);
      return this;
    }

    reseat(id1, id2, id3, id4) {
      this._props["seats"] = [id1, id2, id3, id4];
      return this;
    }

    decode(code) {
      // To decode the result and pull instruction ...
      // <type>?<player_id>@<fan>, ...
      const [_type, _players] = code.split("?");
      const _playersList = _players
        .split(",")
        .map((_pCode) => _pCode.split("@"));
      return {
        type: _type,
        players: _playersList // [[<id>, <fan>], ... ]
      };
    }

    generateBalanceSheet() {
      // To calculate the fan for each players in this rounds
      // return [{ playerId: [{ type: ... , count: ... , fan: ... }], ... }, [winner of this round], [updated pull list]]

      const _players = {};
      const _getplayers = (ps, id) => (ps.hasOwnProperty(id) ? ps[id] : []);

      const _getForEachFunc = (count) => (code) => {
        const { type, players } = this.decode(code);
        const _count = parseInt(count(type), 10);
        players.forEach(([id, fan]) => {
          const _playerList = _getplayers(_players, id);
          _playerList.push({
            type: type.includes("pull") ? METHOD_TYPE.BYSUMWITHPULL : type,
            count: _count,
            fan: parseInt(fan, 10)
          });

          _players[id] = _playerList;
          return;
        });

        return;
      };

      // check if clear pull ...
      const _clearPull = this._props["pull"].filter((code) =>
        code.includes("pull0")
      );
      _clearPull.forEach(
        _getForEachFunc((type) => type.substring(5, type.length))
      );

      // set bouns and win for each players
      this._props["result"].forEach(_getForEachFunc((type) => 1));

      // set pull for the winning ...
      const _updatedPull = [];
      const _unclearPull = this._props["pull"].filter((code) =>
        code.includes("pull1")
      );

      _unclearPull.forEach((code) => {
        const { type, players } = this.decode(code);
        const _count = parseInt(type.substring(5, type.length), 10);
        const _players = players.map(([id, fan]) => ({
          id,
          fan: parseInt(fan, 10)
        }));

        const _winner = _players[0].fan > 0 ? _players[0] : _players[1];
        const _loser = _players[0].fan < 0 ? _players[0] : _players[1];

        // find any winning record for the pull winner
        const _winObj = _players[_winner.id].find(
          ({ fan, type }) =>
            fan > 0 &&
            (type === METHOD_TYPE.BYMYSELF || type === METHOD_TYPE.BYOTHER)
        );

        // finding any bet between pull winner and pull loser ...
        const _betInvolvedWinnerAndLoser = this._props["result"].find(
          (code) =>
            code.includes(_winner.id) &&
            code.includes(_loser.id) &&
            (code.includes(METHOD_TYPE.BYMYSELF) ||
              code.includes(METHOD_TYPE.BYOTHER))
        );

        // case 1.): pull winner not winning ...
        if (_winObj === null) {
          const _winnerList = _getplayers(_players, _winner.id);
          const _loserList = _getplayers(_players, _loser.id);

          if (_betInvolvedWinnerAndLoser === null) {
            // case 1.1): pull winner not lose to the loser ...
            // set the pull into balance sheet
            _winnerList.push({
              type: METHOD_TYPE.BYSUMWITHPULL,
              count: _count,
              fan: _winner.fan
            });

            _loserList.push({
              type: METHOD_TYPE.BYSUMWITHPULL,
              count: _count,
              fan: _loser.fan
            });
          } else {
            // case 1.2): pull winner lose to the loser ...
            // set the half - pull into balance sheet
            _winnerList.push({
              type: METHOD_TYPE.BYSUMWITHPULL,
              count: _count,
              fan: Math.floor(_winner.fan / 2)
            });

            _loserList.push({
              type: METHOD_TYPE.BYSUMWITHPULL,
              count: _count,
              fan: Math.floor(_loser.fan / 2)
            });
          }

          _players[_winner.id] = _winnerList;
          _players[_loser.id] = _loserList;
        } else {
          // Case 2: pull winner keep winning ...
          if (_betInvolvedWinnerAndLoser === null) {
            // case 1.1): pull loser not lose to the winner again ...
            // direct copy the pull into updated pull list
            _updatedPull.push(code);
          } else {
            // case 1.2): pull loser lose to the winner again ...
            // new pull fan = 1.5 * old pull fan + winning amount
            // new pull count += 1
            const _decodedBet = this.decode(_betInvolvedWinnerAndLoser);
            const _loserRecord = _decodedBet.players.find(
              ([p, f]) => p === _loser.id
            );
            const _fanToRecord = Math.abs(_loserRecord[1]);
            const _newFan = Math.ceil(1.5 * _winner.fan) + _fanToRecord;
            _updatedPull.push(
              `pull1${_count + 1}?${_winner.id}@${_newFan},${_loser.id}@${
                -1 * _newFan
              }`
            );
          }
        }

        return;
      });

      // any new pull estabish (i.e. new winning without pull ?)
      // loop through the players list to find out the winner of this round and set up pull if necessary
      const _winnersOfThisRound = [];
      Object.entries(_players).forEach(([playerId, listOfRecord]) => {
        const _winObj = listOfRecord.find(
          (record) =>
            (record.type === METHOD_TYPE.BYMYSELF ||
              record.type === METHOD_TYPE.BYOTHER) &&
            record.fan > 0
        );

        if (_winObj !== null) {
          // find loser and check if pull ?
          const _codeForWinner = this._props["result"].find(
            (code) =>
              code.includes(playerId) &&
              (code.includes(METHOD_TYPE.BYMYSELF) ||
                code.includes(METHOD_TYPE.BYOTHER))
          );

          const { players } = this.decode(_codeForWinner);
          players
            .filter(([pid, fan]) => pid !== playerId)
            .forEach(([pid, fan]) => {
              const _newPull = _updatedPull.find(
                (pullCode) =>
                  pullCode.includes(playerId) && pullCode.includes(`${pid}@-`)
              );

              if (_newPull === null) {
                // not exist .. created one ...
                _updatedPull.push(
                  `pull11?${playerId}@${Math.abs(fan)},${pid}@${fan}`
                );
              }

              return;
            });
        }
      });

      return [_players, _winnersOfThisRound, _updatedPull];
    }

    setPull(winnerId, loserId, isClear = true) {
      for (const _idx in this._props["pull"]) {
        const _pull = this._props["pull"][_idx];
        if (_pull.includes(winnerId) && _pull.includes(loserId)) {
          this._props["pull"][_idx] = `pull${isClear ? 0 : 1}${_pull.substring(
            5
          )}`;
          return this;
        }
      }

      return this;
    }

    async validation() {
      // override to check if the props is OK ...
      if (this._props["seats"].length === 0) {
        return false;
      }

      return true;
    }

    toJSON() {
      const {
        createdAt,
        count,
        seats,
        round,
        host,
        hostCount,
        result,
        pull
      } = this._props;

      return {
        id: this._id,
        createdAt,
        count,
        seats,
        round,
        host: {
          at: host,
          count: hostCount,
          by: seats.length === 4 ? seats[host] : ""
        },
        result: result.map((code) => this.decode(code)),
        pull: pull.map((code) => {
          const { type, players } = this.decode(code);
          const _winner = players[0][1] > 0 ? players[0] : players[1];
          const _loser = players[0][1] < 0 ? players[0] : players[1];
          const _isClear = type.substring(0, 5) === "pull0";
          const _count = parseInt(type.substring(5), 10);
          return {
            winner: _winner[0][0],
            loser: _loser[0][0],
            fan: _winner[0][1],
            count: _count,
            icClear: _isClear
          };
        })
      };
    }

    static _getDb() {
      // get rounds db location
      return getRoundsDb(gid);
    }

    static _getProps(props) {
      // rounds define
      const _ret = {
        createdAt: new Date().toISOString().split(".")[0].replace("T", " "),
        count: props.hasOwnProperty("count") ? props["count"] : 1,
        seats: props.hasOwnProperty("seats") ? props["seats"] : [],
        round: props.hasOwnProperty("round") ? props["round"] : 0, // 0,1,2,3
        host: props.hasOwnProperty("host") ? props["host"] : 0, // 0,1,2,3
        hostCount: props.hasOwnProperty("hostCount") ? props["hostCount"] : 0,
        result: props.hasOwnProperty("result") ? props["result"] : [],
        // result = "<type>?<winner>@<fan>,<loser>@<fan>,..."
        pull: props.hasOwnProperty("pull") ? props["pull"] : []
        // pull = "<pull0<count> = clear, pull1<count> = set>?<winner>@<fan>,<loser>@<fan>"
      };

      return _ret;
    }

    static async getRound(count = -1) {
      const _db = this._getDb();
      const _count = count === -1 ? await _db.count({}) : count;
      if (_count === 0) {
        // no latest ... return a new item ...
        return this();
      }

      const _doc = await _db.findOne({ count: _count });
      if (_doc === null) {
        // no such document ...
        throw new Error(`The game - ${gid} is corrupted.`);
      }

      return this(_doc._id, _doc);
    }
  };
};
