export class Log {
  constructor(stdout = console.log) {
    // @params stdout    - The function to display log
    this._stdout = stdout;
    this._debug = true;
  }

  set isDebug(b) {
    // @params b      - Boolean to set logging enable
    this._debug = b;
  }

  async trace(func, ...args) {
    // @params func     - The function call
    // @params args     - The function args

    try {
      const _ret = await Promise.resolve(func(...args));
      this.write({
        "function name": func.name,
        arguments: args,
        result: _ret
      });

      return _ret;
    } catch (err) {
      this.write(err);
      throw err;
    }
  }

  write(obj) {
    // @params obj    - accept Any
    if (!this._debug) {
      return this;
    }

    const _now = new Date().toISOString().split(".")[0].replace("T", " ");
    if (obj instanceof Error) {
      const _code = obj.constructor.name;
      const _msg = obj.message;
      this._stdout(`${_now} - Error`);
      this._stdout("---------------------------------");
      this._stdout(`(${_code}): ${_msg}`);
    } else if (obj instanceof Object && obj.constructor === Object) {
      this._stdout(`${_now} - Logging`);
      this._stdout("---------------------------------");
      Object.entries(obj).forEach(([_k, _v]) => {
        const _txt =
          _v instanceof Object && _v.constructor === Object
            ? JSON.stringify(_v)
            : _v.toString();
        this._stdout(`${_k}: ${_txt}`);
        return;
      });
    } else {
      this._stdout(`${_now} - Logging`);
      this._stdout("---------------------------------");
      this._stdout(`message: ${obj.toString()}`);
    }

    return this;
  }
}

export const printer = Log();
