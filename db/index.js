const Datastore = require("nedb-promises");
const fs = require("fs");

const _getGamesDbPath = () => {
  // The game db path ...
  return `${__dirname}/games.db`;
};

const _getPlayersDbPath = (gid) => {
  // The players db path ...
  return `${__dirname}/${gid}_players.db`;
};

const _getRoundsDbPath = (gid) => {
  // The rounds db path ...
  return `${__dirname}/${gid}_rounds.db`;
};

const _getActionsDbPath = (gid) => {
  // The players db path ...
  return `${__dirname}/${gid}_actions.db`;
};

export const getGamesDb = () => {
  // The game db store the gid, lastUpdated time ...
  return Datastore.create(_getGamesDbPath());
};

export const getPlayersDb = (gid) => {
  // The players db store the game <gid> players involved ...
  return Datastore.create(_getPlayersDbPath(gid));
};

export const getRoundsDb = (gid) => {
  // The rounds db store the game <gid> rounds information ...
  return Datastore.create(_getRoundsDbPath(gid));
};

export const getActionsDb = (gid) => {
  // The actions db store the game <gid> actions list ...
  return Datastore.create(_getActionsDbPath(gid));
};

export const destroyGameDb = async (gid) => {
  // Destroy players file/rounds file
  const _gamesDb = getGamesDb();
  const [_err1, _err2, _err3, _removedNum] = await Promise.all([
    fs.unlink(_getPlayersDbPath(gid)),
    fs.unlink(_getRoundsDbPath(gid)),
    fs.unlink(_getActionsDbPath(gid)),
    _gamesDb.remove({ _id: gid })
  ]);

  return {
    response: {
      isPlayersDel: !_err1,
      isRoundsDel: !_err2,
      isActionsDel: !_err3,
      isGameRemoved: _removedNum >= 1
    }
  };
};
