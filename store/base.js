export class Base {
  constructor(id, props) {
    // @params id       - The uid, null = new item
    // @params props    - The model props ...

    this._id = id;
    this._props = this._getProps(props);
    this._db = this._getDb();
  }

  async validation() {
    // override to check if the props is OK ...
    return true;
  }

  async save() {
    // save the props into store ... get _id if it is new ...
    const _isValid = await this.validation();
    if (_isValid) {
      const _db = this._db;
      if (this._id === null) {
        const _insertedDoc = await _db.insert(this._props);
        this._id = _insertedDoc._id;
      } else {
        const _doc = await _db.findOne({ _id: this._id });
        if (!_doc) {
          const _insertedDoc = await _db.insert(this._props);
          this._id = _insertedDoc._id;
        } else {
          await _db.update({ _id: this._id }, this._props, { multi: false });
        }
      }
    }

    return this;
  }

  async remove() {
    // remove from the store ... set _id be null for next insert ...
    const _db = this._db;
    await _db.remove({ _id: this._id });
    this._id = null;
    return this;
  }

  get id() {
    // id ?
    return this._id;
  }

  set props(obj) {
    // @params obj    - The Object to be updated
    // get the default props .. cross check the key is match to our define ...
    const _defProps = this._getProps({});
    Object.keys(_defProps).forEach((_k) => {
      if (obj.hasOwnProperty(_k)) {
        this._props[_k] = obj[_k];
      }

      return;
    });

    return;
  }

  getProps(key, defaultVal = null) {
    // @params key        - The key of props
    // @parmas defaultVal - If not exist, return ? value

    if (!this._props.hasOwnProperty(key)) {
      return defaultVal;
    }

    return this._props[key];
  }

  static _getDb() {
    // override db location
    return false;
  }

  static _getProps(props) {
    // override default props
    return {};
  }

  static async findById(id) {
    // @params id       - The id of the doc
    const _db = this._getDb();
    const _doc = await _db.findOne({ _id: id });
    if (_doc) {
      return this(_doc._id, _doc);
    }

    return null;
  }

  static async all() {
    const _db = this._getDb();
    return await _db.find({});
  }
}
