import { METHODTYPE } from "@/store/type";

export const bounsCal = (base, type) => {
  if (type === METHODTYPE.CHASE) {
    return -1 * base;
  }

  if (type === METHODTYPE.FLOWER) {
    return base;
  }

  if (type === METHODTYPE.GRASS) {
    return Math.ceil(base / 2);
  }

  if (type === METHODTYPE.DICESAME) {
    return base;
  }

  if (type === METHODTYPE.DICEONETWOTHREE) {
    return -1 * base;
  }

  if (type === METHODTYPE.GONG) {
    return base;
  }

  if (type === METHODTYPE.NOTMATCH) {
    return -2 * base;
  }

  if (type === METHODTYPE.NOTPONG) {
    return -1 * base;
  }

  return base;
};
