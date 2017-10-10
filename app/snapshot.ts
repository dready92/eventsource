class anyObject extends Object {
  [key:string]: any;
}

export default class Snapshot {
  public version: number;
  public payload: anyObject;


  constructor(version: number, payload: object) {
    this.version = version;
    this.payload = payload;
  }
}