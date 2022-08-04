import { printer } from "@/utils/log";
import { Games } from "@/store/games";

export const standardInternalErrorResponse = (req, res, error) => {
  return res.status(500).json({
    data: false,
    error: error.message
  });
};

export const standardErrorResponse = (req, res, error) => {
  const _code = error.statusCode ? error.statusCode : 400;
  return res.status(_code).json({
    data: false,
    error: error.message
  });
};

export const standardResponse = (req, res, data) => {
  return res.status(200).json({ data });
};

export const standardUnknownMethodResponse = (req, res) => {
  return res.status(405).json({
    data: false,
    error: `The request does not accept ${req.method} method`
  });
};

export const gameStandardRequest = (get, post, put, del) => async (
  req,
  res
) => {
  const { gid = "", identity = "" } = req.query;
  try {
    if (gid.length > 0 && identity.length > 0) {
      // find the game ...
      const _game = await printer.trace(Games.findById, gid);
      if (_game === null) {
        const _error = new Error(`There is no game with gid=${gid}`);
        _error.statusCode = 404;
        return standardErrorResponse(req, res, _error);
      }

      // for future use
      req.game = _game;
      req.identity = identity;

      let _response = null;
      if (req.method === "GET" && get !== null) {
        _response = await get(res, req);
      } else if (req.method === "POST" && post !== null) {
        _response = await post(res, req);
      } else if (req.method === "PUT" && put !== null) {
        _response = await put(res, req);
      } else if (req.method === "DELETE" && del !== null) {
        _response = await del(res, req);
      }

      if (_response === null) {
        return standardUnknownMethodResponse(req, res);
      } else if (_response instanceof Error) {
        return standardErrorResponse(req, res, _response);
      }

      return standardResponse(req, res, _response);
    }

    if (gid.length === 0) {
      const _error = new Error(
        "There is no gid provided for searching the game"
      );
      _error.statusCode = 404;
      return standardErrorResponse(req, res, _error);
    }

    if (identity.length === 0) {
      const _error = new Error("Unknown player");
      _error.statusCode = 404;
      return standardErrorResponse(req, res, _error);
    }
  } catch (err) {
    return standardInternalErrorResponse(req, res, err);
  }
};
