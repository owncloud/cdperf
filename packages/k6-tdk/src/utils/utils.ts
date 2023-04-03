import { XMLParser } from 'fast-xml-parser';
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { randomString as _randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { JSONPath } from 'jsonpath-plus';
import { JSONValue } from 'k6';


export const randomString = (length = 10, charset?: string): string => {
  return _randomString(length, charset);
};

export const queryJson = <V extends string>(pathExpression: string, obj?: JSONValue, defaultValue?: V[]): V[] => {
	defaultValue = defaultValue || [];

	if (!obj || !pathExpression) {
		return defaultValue;
	}

	/* eslint-disable @typescript-eslint/ban-ts-comment */
	// @ts-ignore
	const result = new JSONPath({ json: obj, path: pathExpression });

	if (!result.length) {
		return defaultValue;
	}

	if (defaultValue.length > result.length) {
		return [ ...result, defaultValue.slice(result.length) ];
	}

	return result;
};

export const queryXml = <V extends string>(pathExpression: string, obj?: JSONValue, defaultValue?: V[]): V[] => {
	return queryJson<V>(pathExpression, xmlToJson(obj), defaultValue);
};

export const xmlToJson = (obj?: JSONValue): any => {
	return new XMLParser().parse(obj as string);
};

