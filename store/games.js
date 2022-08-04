import { Base } from "@/store/base";
import { getGamesDb } from "@/db";

export class Games extends Base {
  toJSON() {
    const { createdBy, createdAt, name, base, fanRatio } = this._props;
    return {
      id: this._id,
      createdAt,
      name,
      base,
      fanRatio
    };
  }

  static _getDb() {
    // get rounds db location
    return getGamesDb();
  }

  static _getProps(props) {
    // rounds define
    const _ret = {
      createdAt: new Date().toISOString().split(".")[0].replace("T", " "),
      name: props.hasOwnProperty("name") ? props["name"] : "Mahjong Game",
      base: props.hasOwnProperty("base")
        ? Math.abs(parseInt(props["base"], 10))
        : 10,
      fanRatio: props.hasOwnProperty("fanRatio")
        ? Math.abs(parseInt(props["fanRatio"], 10))
        : 1
    };

    return _ret;
  }
}
