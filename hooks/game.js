import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Pusher from "pusher-js";

import { useRequest } from "@/hooks/request";
import { useLocalStore } from "@/hooks/localStore";

export const useGame = (gid) => {
  const [_gameInfo, _setGameInfo] = useState(false);
  const [_gamePlayers, _setGamePlayers] = useState([]);
  const [_gameRounds, _setGameRounds] = useState([]);
  const [_gameActions, _setGameActions] = useState([]);
  const [_connectionStatus, _setConnectionStatus] = useState("unconnected");
  const _router = useRouter();
  const _request = useRequest();
  const {
    gidsList: _gidsList,
    name: _name,
    identity: _identity
  } = useLocalStore();

  const _updateRound = (round) => {
    // export a insert round function after HTTP GET request...
    // [{latest}, {latest - 1}, ... ]

    _setGameRounds((rs) => {
      if (rs.length === 0) {
        return [round];
      }

      const _ret = [];
      let _isAssign = false;
      for (const _idx in rs) {
        const _r = rs[_idx];
        if (round.count > _r.count && !_isAssign) {
          _ret.push(round, _r);
          _isAssign = true;
        } else if (round.count === _r.count) {
          _ret.push(round);
          _isAssign = true;
        } else {
          _ret.push(_r);
        }
      }

      return _ret;
    });
  };

  const _removeRounds = (round) => {
    if (round !== false) {
      // set round
      _setGameRounds((rs) => {
        return rs.filter((r) => r.count !== round.count);
      });
    }
  };

  const _updatePlayers = (players) => {
    // set player ...
    _setGamePlayers((ps) => {
      const _ret = [...ps];
      players.forEach((p) => {
        const _idx = ps.findIndex((op) => op.id === p.id);
        if (_idx === -1) {
          _ret.push(p);
        } else {
          _ret[_idx] = p;
        }
        return;
      });

      return _ret;
    });
  };

  const _insertActions = (actions) => {
    // set action ...
    // [{latest}, {latest - 1}, ...]
    _setGameActions((as) => [...actions.reverse(), ...as]);
  };

  useEffect(() => {
    // get the game ...
    const _fetchGame = async () => {
      const { status: _status, data: _data } = await _request({
        url: `/api/game/${gid}?identity=${_identity()}&name=${_name()}`,
        method: "GET"
      });

      if (_status !== 200 && _status !== 500) {
        // cannot find the game ...
        // remove gid from the localStore ...
        // back to index ...
        _gidsList(false, gid);
        return _router.replace("/");
      }

      // cache the gid into localStore ...
      // set info we got ...
      _gidsList(gid, false);
      _setGameInfo(_data.game);
      _setGameRounds([_data.round]);
      _setGamePlayers(_data.players);
      _setGameActions(_data.actions);
      return;
    };

    _fetchGame();
    return () => true;
  }, [gid, _gidsList, _name, _identity, _request, _router]);

  useEffect(() => {
    if (_gameInfo !== false && _gameInfo !== null) {
      // set up push to listen event ...
      const _pusher = new Pusher(process.env.PUSHER_KEY, {
        cluster: process.env.PUSHER_CLUSTER
      });

      _pusher.connection.bind("error", (err) => {
        _setConnectionStatus(new Error(err.error.data.message));
      });

      _pusher.connection.bind("state_change", (states) => {
        _setConnectionStatus(states.current);
      });

      const _channel = _pusher.subscribe(process.env.PUSHER_CHANNEL_HEAD + gid);
      _channel.bind(
        "update",
        ({
          sender = "",
          game = false,
          players = [],
          round = false,
          actions = []
        }) => {
          if (sender !== _identity()) {
            if (game) {
              _setGameInfo(game);
            }

            if (players.length > 0) {
              _updatePlayers(players);
            }

            if (round !== false) {
              _updateRound(round);
            }

            if (actions.length > 0) {
              _insertActions(actions);
            }
          }
        }
      );

      _channel.bind("remove", ({ sender = "", round = false }) => {
        if (sender !== _identity()) {
          _removeRounds(round);
        }
      });

      return () => _pusher.disconnect();
    }

    return () => true;
  }, [gid, _identity, _gameInfo]);

  const _requestRound = async (count) => {
    // check the record first ...
    const _round = _gameRounds.find((r) => r.count === count);
    if (_round !== null) {
      return true;
    }

    const { status: _status, data: _data } = await _request({
      url: `/api/round/${gid}?count=${count}&identity=${_identity()}`,
      method: "GET"
    });

    if (_status === 200) {
      _updateRound(_data.round);
      return true;
    }

    return false;
  };

  const _requestUpdateRound = async (params) => {
    const { status: _status, data: _data } = await _request({
      url: `/api/round/${gid}?identity=${_identity()}`,
      method: "PUT",
      data: params
    });

    if (_status === 200) {
      _updateRound(_data.round);
      _insertActions(_data.actions);
      return true;
    }

    return false;
  };

  const _requestNextRound = async () => {
    const { status: _status, data: _data } = await _request({
      url: `/api/round/${gid}?identity=${_identity()}`,
      method: "POST"
    });

    if (_status === 200) {
      _updateRound(_data.round);
      _updatePlayers(_data.players);
      _insertActions(_data.actions);
      return true;
    }

    return false;
  };

  const _requestPrevRound = async () => {
    const { status: _status, data: _data } = await _request({
      url: `/api/round/${gid}?identity=${_identity()}`,
      method: "DELETE"
    });

    if (_status === 200) {
      _updateRound(_data.round);
      _updatePlayers(_data.players);
      _insertActions(_data.actions);
      return true;
    }

    return false;
  };

  const _requestUpdatePlayer = async (params) => {
    const { status: _status, data: _data } = await _request({
      url: `/api/player/${gid}?identity=${_identity()}`,
      method: "PUT",
      data: params
    });

    if (_status === 200) {
      _name(_data.players[0].name);
      _updatePlayers(_data.players);
      _insertActions(_data.actions);
      return true;
    }

    return false;
  };

  const _requestUpdateGame = async (params) => {
    const { status: _status, data: _data } = await _request({
      url: `/api/game/${gid}?identity=${_identity()}`,
      method: "PUT",
      data: params
    });

    if (_status === 200) {
      _setGameInfo(_data.game);
      return true;
    }

    return false;
  };

  const _requestLeaveGame = () => {
    _gidsList(false, gid);
    return _router.replace("/");
  };

  return {
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
  };
};
