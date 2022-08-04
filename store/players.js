import { Base } from "@/store/base";
import { METHOD_TYPE } from "@/store/type";
import { getPlayersDb } from "@/db";

export const Players = (gid) => {
  return class Player extends Base {
    decode(encodedList) {
      // @params encodedList  - The list of encoded ["<type>?<count>@<fan>", ...]
      // turn to { <type>: { count: <count>, fan: <fan> }, ... }
      return encodedList.reduce((obj, txt) => {
        const [_type, _count_and_fan] = txt.split("?");
        const [_count, _fan] = _count_and_fan.split("@");
        obj[_type] = { count: _count, fan: _fan };
        return obj;
      }, {});
    }

    encode(decodedObj) {
      // @params decodedObj   - The decoded obj as return of encode
      return Object.entries(decodedObj).map(([_type, _item]) => {
        const { count, fan } = _item;
        return `${_type}?${count}@${fan}`;
      });
    }

    updateFan(list, undo = false) {
      // @params list    - [{ type, count, fan }, ...]
      // @params undo    - is reverse process ?
      const _win_summary = this.decode(this._props["win"]);
      const _lose_summary = this.decode(this._props["lose"]);

      list.forEach(({ type, count, fan }) => {
        const _summary = fan < 0 ? _lose_summary : _win_summary;
        if (!undo) {
          _summary[type].count += count;
          _summary[type].fan += Math.abs(fan);
        } else {
          _summary[type].count -= count;
          _summary[type].fan -= Math.abs(fan);
        }
      });

      this._props["win"] = this.encode(_win_summary);
      this._props["lose"] = this.encode(_lose_summary);
      return this;
    }

    toJSON() {
      const {
        createdAt,
        lastWin,
        name,
        avatar,
        status,
        win,
        lose,
        host,
        identity
      } = this._props;

      const _win = this.decode(win);
      const _lose = this.decode(lose);
      const _winTotal = Object.value(_win).reduce(
        (tot, { fan }) => tot + fan,
        0
      );
      const _loseTotal = Object.value(_lose).reduce(
        (tot, { fan }) => tot + fan,
        0
      );

      return {
        id: identity,
        createdAt,
        lastWin,
        name,
        avatar,
        status,
        host,
        win: _win,
        lose: _lose,
        total: _winTotal - _loseTotal
      };
    }

    static _getDb() {
      // get players db location
      return getPlayersDb(gid);
    }

    static _getProps(props) {
      // players define
      const _inst = Object.values(METHOD_TYPE)
        .map((v) => `${v}?0@0`) // method?<count>@<fan>, ...
        .join(",");

      const _ret = {
        createdAt: new Date().toISOString().split(".")[0].replace("T", " "),
        lastWin: new Date().valueOf(),
        identity: props["identity"],
        name: props.hasOwnProperty("name") ? props["name"] : "Player",
        avatar: props.hasOwnProperty("avatar") ? props["avatar"] : "var",
        status: props.hasOwnProperty("status") ? props["status"] : "......",
        host: props.hasOwnProperty("host") ? props["host"] : false,
        win: _inst,
        lose: _inst
      };

      return _ret;
    }

    static async findById(id) {
      // @params id     - id or identity [localStorage value generate by browser]
      const _db = this._getDb();
      const _doc = await _db.findOne({ $or: [{ _id: id }, { identity: id }] });
      if (_doc) {
        return this(_doc._id, _doc);
      }

      return null;
    }
  };
};
