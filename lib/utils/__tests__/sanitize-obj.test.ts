import { sanitizeObj } from '../sanitizers';

const makeSut = (incomingObj?: Record<string, any>, blackListKeys?: string[], mask?: string) => ({
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
