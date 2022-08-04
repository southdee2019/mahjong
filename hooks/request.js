import axios from "axios";
import { dispatchEvent } from "@/utils/event";

export const useRequest = () => async (params) => {
  dispatchEvent("apiRequest", { requesting: true });
  try {
    const _response = await axios(params);
    const _status = _response.status;
    const _data = _response.data;

    if (_status === 500) {
      // internal error ...
      dispatchEvent("apiRequest", {
        requesting: false,
        error: new Error(_data.error)
      });

      return { status: _status, data: _data.data };
    }

    dispatchEvent("apiRequest", { requesting: false });
    return { status: _status, data: _data.data };
  } catch (err) {
    return dispatchEvent("apiRequest", { requesting: false, error: err });
  }
};
