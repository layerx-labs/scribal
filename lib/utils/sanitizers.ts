export function sanitizeStr(str: string, blackListParams: string[]): string {
  return blackListParams.reduce((acc: string, param: string) => {
    const regex = new RegExp(
      `(\\"){0,1}\\b${param}(?!:\\s\\*\\*\\*\\*\\*\\*)[^A-Za-z0-9]{1,}[A-Za-z0-9!-+--/:-@_]+\\b(\\"){0,1}`,
      'gi'
    );
    return acc.replace(regex, `${param}: ******`);
  }, str);
}
