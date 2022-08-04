import { printer } from "@/utils/log";
import { trigger } from "@/utils/push";

import { Rounds } from "@/store/rounds";
import { Players } from "@/store/players";
import { Actions } from "@/store/actions";
import { ACTION_TYPE } from "@/store/type";

import { gameStandardRequest } from "@/middlewares";

const _get = async (req, res) => {
  const { count = -1 } = req.query;
  const _Rounds = Rounds(req.game.id);
  const _round = await printer.trace(_Rounds.getRound, count);
  return { round: _round };
};

const _post = async (req, res) => {
  const _Rounds = Rounds(req.game.id);
  const _Players = Players(req.game.id);
  const _Actions = Actions(req.game.id);
  const _roundLatest = await printer.trace(_Rounds.getRound);

  //get the balance sheet from the latest round.
  const [
    _playerRecords,
    _winnersOfThisRound,
    _updatedPullTable
  ] = await printer.trace(_roundLatest.generateBalanceSheet);

  // update the players ...
  const _players = await Promise.all(
    Object.entries(_playerRecords).map(async ([id, record]) => {
      const _player = await printer.trace(_Players.findById, id);
      _player.updateFan(record);
      return printer.trace(_player.save);
    })
  );

  const _prevHost = _roundLatest.getProps("host");
  const _prevHostCount = _roundLatest.getProps("hostCount");
  const _prevR = _roundLatest.getProps("round");
  const _seats = _roundLatest.getProps("seats");

  let _newHost = _prevHost;
  let _newR = _prevR;
  if (_winnersOfThisRound.length > 0) {
    let _isHost = false;
    for (const _idx in _winnersOfThisRound) {
      if (_idx === _prevHost) {
        _isHost = true;
        break;
      }
    }

    if (!_isHost) {
      _newHost += 1;
      if (_newHost >= 4) {
        _newHost = 0;
        _newR += 1;
        if (_newR >= 4) {
          _newR = 0;
        }
      }
    }
  }

  // create new round ...
  const _newRound = new Rounds(null, {
    count: _roundLatest.getProps("count") + 1,
    seats: _seats,
    round: _newR,
    host: _newHost,
    hostCount: _newHost !== _prevHost ? 0 : _prevHostCount + 1,
    result: [],
    pull: _updatedPullTable
  });
  await printer.trace(_newRound.save);

  // log the action
  const _action = new _Actions(null, {
    event: ACTION_TYPE.NEXT,
    by: req.identity,
    args: {
      round: _newRound.getProps("round"),
      host: _newRound.getProps("host"),
      count: _newRound.getProps("count")
    }
  });
  await printer.trace(_action.save);

  // publish to the group
  trigger(req.game.id, "update", req.identity, {
    players: _players,
    round: _newRound,
    actions: [_action]
  });

  return { players: _players, round: _newRound };
};

const _put = async (req, res) => {
  const {
    seats = false,
    removeResult = false,
    newResult = false,
    pull = false
  } = req.body;
  // seats = [list of new id]
  // newResult = { who, type, others = {}, idx = -1 }
  // removeResult = { idx }
  // pull = { winnerId, loserId, isClear = true }

  const _Rounds = Rounds(req.game.id);
  const _Actions = Actions(req.game.id);
  const _roundLatest = await printer.trace(_Rounds.getRound);
  let _action = null;

  if (seats) {
    _roundLatest.reseat(...seats);

    // log the action
    _action = new _Actions(null, {
      event: ACTION_TYPE.RESEAT,
      by: req.identity,
      args: { seats }
    });
  }

  if (removeResult) {
    const { idx } = removeResult;
    _roundLatest.removeResult(idx);

    // log the action
    _action = new _Actions(null, {
      event: ACTION_TYPE.REMOVE_RESULT,
      by: req.identity,
      args: { idx }
    });
  }

  if (newResult) {
    _roundLatest.addResult(newResult);

    // log the action
    _action = new _Actions(null, {
      event: ACTION_TYPE.ADD_RESULT,
      by: req.identity,
      args: newResult
    });
  }

  if (pull) {
    const { winnerId, loserId, isClear } = pull;
    _roundLatest.setPull(winnerId, loserId, isClear);

    // log the action
    _action = new _Actions(null, {
      event: ACTION_TYPE.SET_PULL,
      by: req.identity,
      args: pull
    });
  }

  if (_action === null) {
    return {};
  }

  await printer.trace(_roundLatest.save);
  await printer.trace(_action.save);

  // publish to the group
  trigger(req.game.id, "update", req.identity, {
    round: _roundLatest,
    actions: [_action]
  });

  return { round: _roundLatest };
};

const _del = async (req, res) => {
  const _Rounds = Rounds(req.game.id);
  const _Players = Players(req.game.id);
  const _Actions = Actions(req.game.id);
  const _roundLatest = await printer.trace(_Rounds.getRound);

  // This is the first round already ...
  if (_roundLatest.getProps("count") === 1) {
    return {};
  }

  // otherwise remove the latest round
  await printer.trace(_roundLatest.remove);

  // get the prev round ...
  const _roundPrev = await printer.trace(_Rounds.getRound);

  //get the balance sheet from the prev round.
  const _ret = await printer.trace(_roundPrev.generateBalanceSheet);

  // update the players (undo) ...
  const _players = await Promise.all(
    Object.entries(_ret[0]).map(async ([id, record]) => {
      const _player = await printer.trace(_Players.findById, id);
      _player.updateFan(record, true);
      return printer.trace(_player.save);
    })
  );

  // log the action
  const _action = new _Actions(null, {
    event: ACTION_TYPE.PREV,
    by: req.identity,
    args: {
      round: _roundPrev.getProps("round"),
      host: _roundPrev.getProps("host"),
      count: _roundPrev.getProps("count")
    }
  });
  await printer.trace(_action.save);

  // publish to the group
  trigger(req.game.id, "remove", req.identity, {
    round: { count: _roundLatest.getProps("count") }
  });

  trigger(req.game.id, "update", req.identity, {
    players: _players,
    round: _roundPrev,
    actions: [_action]
  });

  return { players: _players, round: _roundPrev };
};

export default gameStandardRequest(_get, _post, _put, _del);
