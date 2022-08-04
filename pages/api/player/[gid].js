import { printer } from "@/utils/log";
import { trigger } from "@/utils/push";

import { Players } from "@/store/players";
import { Actions } from "@/store/actions";
import { ACTION_TYPE } from "@/store/type";

import { gameStandardRequest } from "@/middlewares";

const _put = async (req, res) => {
  const _Players = Players(req.game.id);
  const _Actions = Actions(req.game.id);

  // get my information in this game ...
  let _me = await printer.trace(_Players.findById, req.identity);
  if (_me === null) {
    return new Error(`There is no player with identity=${req.identity}`);
  }

  // track the player update...
  const _action = new _Actions(null, {
    event: ACTION_TYPE.UPDATE_PLAYER,
    by: req.identity,
    args: {
      name: req.query.hasOwnProperty("name"),
      avatar: req.query.hasOwnProperty("avatar"),
      status: req.query.hasOwnProperty("status")
    }
  });
  await printer.trace(_action.save);

  // publish to the group
  trigger(req.game.id, "update", req.identity, {
    players: [_me],
    actions: [_action]
  });
  return { players: [_me] };
};

export default gameStandardRequest(null, null, _put, null);
