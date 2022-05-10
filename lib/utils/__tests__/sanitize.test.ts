import sanitize from '../sanitizers';

const makeSut = (incomingContent?: any, blackListKeys?: string[], mask?: string) => ({
  sut: sanitize,
  blackListKeys,
  incomingContent,
  mask,
});

describe(sanitize.name, () => {
  const person = {
    name: 'marshall pd',
    age: 25,
    address: {
      country: 'Angola',
      province: 'Luanda',
    },
    phoneNumber: '+244 999 999 999',
    email: 'hebojosemar@gmail.com',
    logins: [
      {
        username: 'marshall',
        password: '123qwe123',
      },
      {
        username: 'taikai',
        password: '1969',
      },
    ],
  };

  it('should mask an object inside an array', () => {
    const { sut, incomingContent, blackListKeys, mask } = makeSut(person, ['password'], '*');
    const result = sut(incomingContent, blackListKeys, mask);

    expect(result).toStrictEqual({
      name: 'marshall pd',
      age: 25,
      address: {
        country: 'Angola',
        province: 'Luanda',
      },
      phoneNumber: '+244 999 999 999',
      email: 'hebojosemar@gmail.com',
      logins: [
        {
          username: 'marshall',
          password: '******',
        },
        {
          username: 'taikai',
          password: '******',
        },
      ],
    });
  });

  it('should mask the passwords inside the string', () => {
    const { sut, incomingContent, blackListKeys, mask } = makeSut(
      'email: regular@taikai.network, password: 1969, address: moon',
      ['password'],
      '*'
    );
    const result = sut(incomingContent, blackListKeys, mask);

    expect(result).toEqual('email: regular@taikai.network, password: ******, address: moon');
  });

  it('should mask the passwords inside the array', () => {
    const { sut, incomingContent, blackListKeys, mask } = makeSut(
      [
        'email: josemar@taikai.network, password: 1234, address: earth',
        'email: pateta@taikai.network, password: abcd, address: jupiter',
        'email: regular@taikai.network, password: 1969, address: moon',
      ],
      ['password'],
      '*'
    );
    const result = sut(incomingContent, blackListKeys, mask);

    expect(result).toEqual([
      'email: josemar@taikai.network, password: ******, address: earth',
      'email: pateta@taikai.network, password: ******, address: jupiter',
      'email: regular@taikai.network, password: ******, address: moon',
    ]);
  });
});
