import Event from './event';

export default class SourceEvent extends Event {
  version: number;
  timestamp: number;
}