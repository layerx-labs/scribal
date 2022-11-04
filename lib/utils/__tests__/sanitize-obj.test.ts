import { sanitizeObj } from '../sanitizers';

const makeSut = (incomingObj: Record<string, any>, blackListKeys: string[], mask?: string) => ({
  sut: sanitizeObj,
  blackListKeys,
  incomingObj,
  mask,
});

describe(sanitizeObj.name, () => {
  const person = {
    name: 'marshall pd',
    age: 25,
    address: {
      country: 'Angola',
      province: 'Luanda',
    },
    phoneNumber: '+244 999 999 999',
    email: 'hebojosemar@gmail.com',
    user: {
      username: 'marshall',
      password: '123qwe123',
    },
  };
  it('should mask the password with *', () => {
    const { sut, incomingObj, blackListKeys } = makeSut(person, ['password']);
    const result = sut(incomingObj, blackListKeys);

    expect(result).toStrictEqual({ ...person, user: { ...person.user, password: '******' } });
  });

  it('should mask the password and email with ?', () => {
    const { sut, incomingObj, blackListKeys, mask } = makeSut(person, ['password', 'email'], '?');
    const result = sut(incomingObj, blackListKeys, mask);

    expect(result).toStrictEqual({
      ...person,
      user: { ...person.user, password: '??????' },
      email: '??????',
    });
  });

  it('should mask an object inside an array', () => {
    const { sut, incomingObj, blackListKeys, mask } = makeSut(
      {
        users: [
          { username: 'taikai1', password: '1234' },
          { username: 'taikai2', password: 'abcd' },
          { username: 'taikai3', password: '1969' },
        ],
      },
      ['password'],
      '?'
    );
    const result = sut(incomingObj, blackListKeys, mask);

    expect(result).toStrictEqual({
      users: [
        { username: 'taikai1', password: '??????' },
        { username: 'taikai2', password: '??????' },
        { username: 'taikai3', password: '??????' },
      ],
    });
  });

  it('should include all the Error properties', () => {
    const { sut, incomingObj, blackListKeys, mask } = makeSut(new Error('my error message'), []);
    const result = sut(incomingObj, blackListKeys, mask);

    expect(result.message).toEqual('my error message');
    expect(result.name).toEqual('Error');
    expect(result.stack.length).toBeGreaterThan(0);
  });

  describe('Passed an empty object and/or an empty blacklist', () => {
    it('should return the passed empty object - empty blacklist', () => {
      const { sut, incomingObj, blackListKeys } = makeSut({}, []);
      const result = sut(incomingObj, blackListKeys);

      expect(result).toStrictEqual({});
    });

    it('should return an empty object - empty string', () => {
      const { sut, incomingObj, blackListKeys } = makeSut({}, ['password']);
      const result = sut(incomingObj, blackListKeys);

      expect(result).toEqual({});
    });

    it('should return an empty object - empty blacklist and empty string', () => {
      const { sut, incomingObj, blackListKeys } = makeSut({}, []);
      const result = sut(incomingObj, blackListKeys);

      expect(result).toEqual({});
    });
  });
});
