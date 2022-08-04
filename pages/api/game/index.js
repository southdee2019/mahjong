import { printer } from "@/utils/log";
import { Games } from "@/store/games";
import { Players } from "@/store/players";
import { Rounds } from "@/store/rounds";
import { Actions } from "@/store/actions";
import { ACTION_TYPE } from "@/store/type";

import {
  standardResponse,
  standardErrorResponse,
  standardInternalErrorResponse,
  standardUnknownMethodResponse
} from "@/middlewares";

export default async function handler(req, res) {
  const {
    base = 10,
    fanRatio = 1,
    name = "New Game",
    creatorName = "Player",
    creatorIdentity = ""
  } = req.body;

  if (req.method === "POST") {
    if (creatorIdentity.length === 0) {
      return standardErrorResponse(req, res, new Error("Unknown game creator"));
    }

    try {
      // create new game ...
      const _game = new Games(null, { name, base, fanRatio });
      await printer.trace(_game.save);
      const _player = new Players(_game.id)(null, {
        name: creatorName,
        identity: creatorIdentity,
        host: true
      });

      await printer.trace(_player.save);
      const _round = new Rounds(_game.id)(null, {});
      await printer.trace(_round.save);
      const _action = new Actions(_game.id)(null, {
        by: _player.id,
        event: ACTION_TYPE.CREATE_GAME
      });
      await printer.trace(_action.save);

      return standardResponse(req, res, {
        game: { id: _game.id }
      });
    } catch (err) {
      return standardInternalErrorResponse(req, res, err);
    }
  }

  return standardUnknownMethodResponse(req, res);
}
