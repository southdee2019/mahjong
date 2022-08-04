export const useLocalStore = () => {
  const _nameKey = "mahjong:name";
  const _identityKey = "mahjong:identity";
  const _gidListKey = "mahjong:gid_list";
  return {
    gidsList: (newId = false, removeId = false) => {
      if (typeof window !== "undefined") {
        const _gids = window.localStorage.getItem(_gidListKey) || "";
        let _gidsArray = _gids.length === 0 ? [] : _gids.split(",");
        if (newId) {
          if (!_gidsArray.includes(newId)) {
            _gidsArray = [newId, ..._gidsArray];
          }
        }

        if (removeId) {
          _gidsArray = _gidsArray.filter((gid) => gid !== removeId);
        }

        window.localStorage.setItem(_gidListKey, _gidsArray.join(","));
        return _gidsArray;
      }

      return [];
    },
    identity: () => {
      if (typeof window !== "undefined") {
        const _identity =
          window.localStorage.getItem(_identityKey) ||
          new Date().valueOf().toString();
        window.localStorage.setItem(_identityKey, _identity);
        return _identity;
      }

      return new Date().valueOf().toString();
    },
    name: (newName = "") => {
      if (typeof window !== "undefined") {
        const _newName = newName.trim();
        if (_newName.length === 0) {
          const _name = window.localStorage.getItem(_nameKey) || "Player";
          window.localStorage.setItem(_nameKey, _name);
          return _name;
        }

        window.localStorage.setItem(_nameKey, _newName);
        return _newName;
      }

      return "Player";
    }
  };
};
