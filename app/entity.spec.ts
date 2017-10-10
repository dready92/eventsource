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

  describe('snapshot() method', () => {
    function createUser(id: string = 'a') {
      const user = new User(id);
      user.digest({name: 'createUser', id: null, payload: {
        login: 'jdoe',
        email: 'jdoe@acme.corp'
      }});
      return user; 
    }

    it('should snapshot strings', () => {
      const user = createUser();
      const snapshot = user.snapshot();
      expect(snapshot).to.deep.equal({
        groups: [],
        id: 'a',
        login: 'jdoe',
        email: 'jdoe@acme.corp',
      });
    });

  });

  it('should digest createUser', () => {
    const user = new User('a');
    user.digest({name: 'createUser', id: null, payload: {
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
      user.digest({name: 'createUser', id: null, payload: {
        login: 'jdoe',
        email: 'jdoe@acme.corp'
      }});
    });

    it('should push in an array', () => {
      user.digest({name: 'addToGroup', id: 'a', payload: {
        group: 'group1'
      }});
      expect(user.groups).to.deep.equal(['group1']);
    });

    it('should push in an array several times', () => {
      user.digest({name: 'addToGroup', id: 'a', payload: {
        group: 'group1'
      }});
      user.digest({name: 'addToGroup', id: 'a', payload: {
        group: 'group2'
      }});
      expect(user.groups).to.deep.equal(['group1', 'group2']);
    });
  });

});