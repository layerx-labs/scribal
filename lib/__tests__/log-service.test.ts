import LogService from '../index';

const makeSut = (_blackListParams?: string[]) => new LogService(_blackListParams);

describe(LogService.name, () => {
  const blacklist = ['password', 'phoneNumber', 'email'];

  it('should return the blacklist', () => {
    const sut = makeSut(blacklist);
    const result = sut.getBlackListParams();
    expect(result).toStrictEqual(blacklist);
  });

  it('should change the value of initial blacklist', () => {
    const sut = makeSut(blacklist);
    sut.setBlackListParams(['only_param']);
    const result = sut.getBlackListParams();
    expect(result).toStrictEqual(['only_param']);
  });

  it('should add new elements into blacklist', () => {
    const oldBlacklist = [...blacklist];
    const sut = makeSut(blacklist);
    sut.addToBlackList(['new_param', 'another_new_param']);
    const result = sut.getBlackListParams();
    expect(result).toStrictEqual([...oldBlacklist, 'new_param', 'another_new_param']);
  });

  it('should remove the elements from blacklist', () => {
    const sut = makeSut(blacklist);
    sut.removeFromBlackList('email');
    const result = sut.getBlackListParams();
    expect(result).not.toContain('email');
  });
});
