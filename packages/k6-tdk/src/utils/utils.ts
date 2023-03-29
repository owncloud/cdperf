import { XMLParser } from 'fast-xml-parser';
import { JSONPath } from 'jsonpath-plus';
import { JSONValue } from 'k6';

import { URLSearchParams } from './k6/url';


export const cleanURL = (...parts: string[]): string => {
	return parts.join('/').replace(/(?<!:)\/+/gm, '/');
};

export const objectToQueryString = (o: { [key: string]: string | number }): string => {
	return Object.keys(o)
		.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(o[ key ] || ''))
		.join('&');
};

export const queryStringToObject = (qs?: string): { [key: string]: string } => {
	return new URLSearchParams(new URL(qs || '').search).object();
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
	const xmlParser = new XMLParser();

	return queryJson<V>(pathExpression, xmlParser.parse(obj as string), defaultValue);
};

export const xmlToJson = (obj?: JSONValue): any => {
	return new XMLParser().parse(obj as string);
};

