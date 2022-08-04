import { printer } from "@/utils/log";
import { trigger } from "@/utils/push";

import { Players } from "@/store/players";
import { Rounds } from "@/store/rounds";
import { Actions } from "@/store/actions";
import { ACTION_TYPE } from "@/store/type";

import { gameStandardRequest } from "@/middlewares";

const _get = async (req, res) => {
  const { name = "Player" } = req.query;
  const _Players = Players(req.game.id);
  const _Rounds = Rounds(req.game.id);
  const _Actions = Actions(req.game.id);

  // get my information in this game ...
  let _me = await printer.trace(_Players.findById, req.identity);
  if (_me === null) {
    _me = new _Players(null, { name, identity: req.identity });
    await printer.trace(_me.save);

    // track the creator of player ...
    const _action = new _Actions(null, {
      event: ACTION_TYPE.JOIN_GAME,
      by: req.identity
    });
    await printer.trace(_action.save);

    // publish to the group ... I join the game ...
    trigger(req.game.id, "update", req.identity, {
      players: [_me],
      actions: [_action]
    });
  }

  // get the latest round and all players to initial setup the game page ...
  const [_round, _players, _actions] = await Promise.all([
    printer.trace(_Rounds.getRound),
    printer.trace(_Players.all),
    printer.trace(_Actions.all)
  ]);

  return {
    game: req.game,
    round: _round,
    players: _players,
    actions: _actions
  };
};

const _put = async (req, res) => {
  const { name = "New Game" } = req.body;
  req.game.props = { name };
  await printer.trace(req.game.save);

  // publish to the group about rename ...
  trigger(req.game.id, "update", req.identity, {
    game: req.game
  });

  return {
    game: req.game
  };
};

export default gameStandardRequest(_get, null, _put, null);
