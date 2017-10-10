import Event from './event';
import Snapshot from './snapshot';
import {cloneDeep} from 'lodash';

export default abstract class Entity {
  [key:string]: any;
  public __eventsToEmit: Array<Event>;
  public __replaying: boolean;
  public __snapshotVersion: number;
  public __timestamp: number;
  public __version: number;

  abstract digest(event: Event): Entity;


  constructor() {
    this.__eventsToEmit = [];
    this.__replaying = false;
    this.__version = 0;
    this.__snapshotVersion = 0;
    this.__timestamp = Date.now();
  }


  public init(snapshot: Snapshot, events: Array<Event>): Entity {
    if (snapshot) {
      this.applySnapshot(snapshot);
    }
    if (events) {

    }

    return this;
  }

  private applyEvents(events: Array<Event>): Entity {
    events.forEach(event => {
      this.digest(event);
    });

    return this;
  }

  private applySnapshot(snapshot: Snapshot): Entity {
    Object.keys(snapshot.payload).forEach(key => {
      this[key] = snapshot.payload[key];
    });

    return this;
  }

  public snapshot(): any {
    const plainObject = cloneDeep(this);
    delete plainObject.__eventsToEmit;
    delete plainObject.__replaying;
    delete plainObject.__snapshotVersion;
    delete plainObject.__timestamp;
    delete plainObject.__version;
    return JSON.parse(
      JSON.stringify(plainObject)
    );
  }

}
