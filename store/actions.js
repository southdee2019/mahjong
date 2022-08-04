import { Base } from "@/store/base";
import { getActionsDb } from "@/db";

export const Actions = (gid) => {
  return class Action extends Base {
    async validation() {
      // override to check if the props is OK ...
      if (this._props["by"].length === 0 || this._props["event"].length === 0) {
        return false;
      }

      return true;
    }

    toJSON() {
      const { createdAt, by, event, args } = this._props;
      return {
        createdAt,
        by,
        event,
        args
      };
    }

    static _getDb() {
      // get players db location
      return getActionsDb(gid);
    }

    static _getProps(props) {
      // actions define
      const _ret = {
        createdAt: new Date().toISOString().split(".")[0].replace("T", " "),
        by: props.hasOwnProperty("by") ? props["by"] : "",
        event: props.hasOwnProperty("event") ? props["event"] : "",
        args: props.hasOwnProperty("args") ? props["args"] : {}
      };

      return _ret;
    }
  };
};
