/// <reference types="mocha" />

import {expect} from 'chai';
import Event from './event';
import Entity from './entity';
import 'mocha';

let id = 0;

debugger;

interface User_CreateEvent_Payload {
  login: string;
  email: string;
}

class User_CreateEvent extends Event {
  public payload: User_CreateEvent_Payload;
}

class User extends Entity {
  public id: string;
  public login: string;
  public email: string;
  public groups: Array<string> = [];

  constructor(id: string) {
    super();
    this.id = id;
  }

  digest(event: Event): User {
    if (event.name === 'createUser') {
      this.id = 'a';
      this.login = event.payload.login;
      this.email = event.payload.email;
    } else if (event.name === 'addToGroup') {
      this.groups.push(event.payload.group);
    }

    return this;
  }
}

describe('the Entity class', () => {
  
  describe('replay() method', () => {
    it('should restore from a snapshot', () => {
      const u = new User('10');
      u.replay({version: 0, payload: {
        groups: ['group1'],
        id: 'a',
        login: 'jdoe',
        email: 'jdoe@acme.corp',
      }}, null);

      expect(u.id).to.equal('a');
      expect(u.login).to.equal('jdoe');
      expect(u.email).to.equal('jdoe@acme.corp');
      expect(u.groups).to.deep.equal(['group1']);
    });

    it('should restore from events', () => {
      const u = new User('10');
      u.replay(null, [
        {name: 'createUser', version: 0, timestamp: 10, payload: {
          login: 'jdoe',
          email: 'jdoe@acme.corp'
        }},
        {name: 'addToGroup', version: 1, timestamp: 11, payload: {
          group: 'group1'
        }}
      ]);

      expect(u.id).to.equal('a');
      expect(u.login).to.equal('jdoe');
      expect(u.email).to.equal('jdoe@acme.corp');
      expect(u.groups).to.deep.equal(['group1']);
    });
  });

  describe('snapshot() method', () => {
    function createUser(id: string = 'a') {
      const user = new User(id);
      user.digest({name: 'createUser', payload: {
        login: 'jdoe',
        email: 'jdoe@acme.corp'
      }});
      return user; 
    }

    it('should snapshot strings', () => {
      const user = createUser();
      const snapshot = user.snapshot();
      expect(snapshot).to.deep.equal({version: 0, payload:{
        groups: [],
        id: 'a',
        login: 'jdoe',
        email: 'jdoe@acme.corp',
      }});
    });

  });

  describe('digest method()', () => {
    it('should digest createUser', () => {
      const user = new User('a');
      user.digest({name: 'createUser', payload: {
        login: 'jdoe',
        email: 'jdoe@acme.corp'
      }});

      expect(user.login).to.equal('jdoe');
      expect(user.email).to.equal('jdoe@acme.corp');
      expect(user.id).to.equal('a');
    });

    describe('array testing', () => {
      let user: User;

      beforeEach(() => {
        user = new User('a');
        user.digest({name: 'createUser', payload: {
          login: 'jdoe',
          email: 'jdoe@acme.corp'
        }});
      });

      it('should push in an array', () => {
        user.digest({name: 'addToGroup', payload: {
          group: 'group1'
        }});
        expect(user.groups).to.deep.equal(['group1']);
      });

      it('should push in an array several times', () => {
        user.digest({name: 'addToGroup', payload: {
          group: 'group1'
        }});
        user.digest({name: 'addToGroup', payload: {
          group: 'group2'
        }});
        expect(user.groups).to.deep.equal(['group1', 'group2']);
      });
    });
  });
});