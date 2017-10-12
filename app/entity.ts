import {EventEmitter} from 'events';

import Event from './event';
import SourceEvent from './source-event';
import Snapshot from './snapshot';
import {cloneDeep} from 'lodash';

export default abstract class Entity extends EventEmitter {
  [key:string]: any;
  public __eventsToEmit: Array<SourceEvent>;
  public __replaying: boolean;
  public __snapshotVersion: number;
  public __timestamp: number;
  public __version: number;

  abstract digest(event: Event): Entity;


  constructor() {
    super();
    this.__eventsToEmit = [];
    this.__replaying = false;
    this.__version = 0;
    this.__snapshotVersion = 0;
    this.__timestamp = Date.now();
  }

  public emit(name: string|symbol, ...args: any[]): void {
    if (this.__replaying) {
      return;
    }
    super.emit(name, ...args);
  }
  
  public replay(snapshot: Snapshot, events: Array<SourceEvent>): Entity {
    this.__replaying = true;
    if (snapshot) {
      this.applySnapshot(snapshot);
    }
    if (events) {
      this.applyEvents(events);
    }
    this.__replaying = false;
    
    return this;
  }

  private applyEvents(events: Array<Event>): Entity {
    events.forEach(event => {
      this.digest(event);

      if (this.__replaying) {
        return;
      }

      this.__version++;
      const sourceEvent = new SourceEvent();
      sourceEvent.name = event.name;
      sourceEvent.payload = event.payload;
      sourceEvent.version = this.__version;
      sourceEvent.timestamp = Date.now();
      this.__eventsToEmit.push(sourceEvent);
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
    const plainObject = JSON.parse(
      JSON.stringify(this)
    );
    delete plainObject.__eventsToEmit;
    delete plainObject.__replaying;
    delete plainObject.__snapshotVersion;
    delete plainObject.__timestamp;
    delete plainObject.__version;
    return new Snapshot(this.__version, plainObject);
  }

}
