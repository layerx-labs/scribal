/**
 * Mask the string coming after the keys specified in the blackListParams
 * @param str The string to be sanitized
 * @param blackListParams The list containing the blacklisted keys
 * @param mask default value = '*'
 * @returns The string sanitized
 */
export function sanitizeStr(str: string, blackListParams: string[], mask?: string): string {
  const sanitizer = (_str: string, _mask?: string) =>
    blackListParams.reduce((acc: string, param: string) => {
      const regex = new RegExp(
        `(\\"){0,1}\\b${param}(?!:\\s${`\\${_mask ?? '*'}`.repeat(
          6
        )})[^A-Za-z0-9]{1,}[A-Za-z0-9!-+--/:-@_]+\\b(\\"){0,1}`,
        'gi'
      );
      return acc.replace(regex, `${param}: ${(_mask ?? '*').repeat(6)}`);
    }, _str);

  try {
    // Try to transform it into an object to person the `sanitizeObj`
    const obj = JSON.parse(str);
    return typeof obj === 'object'
      ? JSON.stringify(sanitizeObj(obj, blackListParams, mask))
      : sanitizer(str, mask);
  } catch (error) {
    // If failed converting to object, working with string as it is
    return sanitizer(str, mask);
  }
}

/**
 * Mask the object values that have its key specified in the blackListKeys
 * @param obj The object to be sanitized
 * @param blackListKeys The list containing the blacklisted keys
 * @param mask default value = '*'
 * @returns The object sanitized
 */
export function sanitizeObj(obj: Record<string, any>, blackListKeys: string[], mask?: string) {
  const sanitizer = (_obj: Record<string, any>, _mask?: string) =>
    Object.entries(_obj).reduce((acc, [key, value]) => {
      acc[key] = blackListKeys.includes(key)
        ? (_mask ?? '*').repeat(6)
        : typeof value === 'object'
        ? sanitizer(value, _mask)
        : value;
      return acc;
    }, {} as Record<string, any>);

  return sanitizer(obj, mask);
}
