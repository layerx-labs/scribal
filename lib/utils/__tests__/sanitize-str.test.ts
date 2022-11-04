import { sanitizeStr } from '../sanitizers';

const makeSut = (incomingStr: string, blackListParams: string[], mask?: string) => ({
  sut: sanitizeStr,
  blackListParams,
  incomingStr,
  mask,
});

describe(sanitizeStr.name, () => {
  const person =
    '{"name":"marshall pd","age":25,"address":{"country":"Angola","province":"Luanda"},"phoneNumber":"+244 999 999 999","email":"hebojosemar@gmail.com","user":{"username":"marshall","password":"123qwe123"}}';

  it('should mask the password with *', () => {
    const { sut, incomingStr, blackListParams } = makeSut(
      'email: hebojosemar@gmail.com, password: 1234, address: earth',
      ['password']
    );
    const result = sut(incomingStr, blackListParams);

    expect(result).toEqual('email: hebojosemar@gmail.com, password: ******, address: earth');
  });

  it('should mask the password and email with ?', () => {
    const { sut, incomingStr, blackListParams, mask } = makeSut(
      'email: hebojosemar@gmail.com, password: 1234, address: earth',
      ['password', 'email'],
      '?'
    );
    const result = sut(incomingStr, blackListParams, mask);

    expect(result).toEqual('email: ??????, password: ??????, address: earth');
  });

  it('should mask the blacklisted keys with +', () => {
    const { sut, incomingStr, blackListParams, mask } = makeSut(person, ['password', 'email'], '+');
    const result = sut(incomingStr, blackListParams, mask);

    expect(result).toEqual({
      name: 'marshall pd',
      age: 25,
      address: {
        country: 'Angola',
        province: 'Luanda',
      },
      phoneNumber: '+244 999 999 999',
      email: '++++++',
      user: {
        username: 'marshall',
        password: '++++++',
      },
    });
  });

  it('should mask the blacklisted keys with _', () => {
    const { sut, incomingStr, blackListParams, mask } = makeSut(
      person,
      ['age', 'username', 'password', 'email'],
      '_'
    );
    const result = sut(incomingStr, blackListParams, mask);

    expect(result).toEqual({
      name: 'marshall pd',
      age: '______',
      address: {
        country: 'Angola',
        province: 'Luanda',
      },
      phoneNumber: '+244 999 999 999',
      email: '______',
      user: {
        username: '______',
        password: '______',
      },
    });
  });

  describe('Passed an empty string and/or an empty blacklist', () => {
    it('should return the passed string - empty blacklist', () => {
      const { sut, incomingStr, blackListParams } = makeSut(
        'email: hebojosemar@gmail.com, password: 1234, address: earth',
        []
      );
      const result = sut(incomingStr, blackListParams);

      expect(result).toEqual('email: hebojosemar@gmail.com, password: 1234, address: earth');
    });

    it('should return an empty string - empty string', () => {
      const { sut, incomingStr, blackListParams } = makeSut('', ['password']);
      const result = sut(incomingStr, blackListParams);

      expect(result).toEqual('');
    });

    it('should return an empty string - empty blacklist and empty string', () => {
      const { sut, incomingStr, blackListParams } = makeSut('', []);
      const result = sut(incomingStr, blackListParams);

      expect(result).toEqual('');
    });
  });
});
