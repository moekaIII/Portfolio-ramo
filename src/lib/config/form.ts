import { PUBLIC_FORM_ENDPOINT } from '$app/env/public';
import { site } from './site.ts';

/** お問い合わせの送信先（環境変数 > site.ts の既定値） */
export const formEndpoint: string = PUBLIC_FORM_ENDPOINT ?? site.form.fallbackEndpoint;

export const formConfig = {
	endpoint: formEndpoint,
	honeypotField: site.form.honeypotField,
	extraFields: site.form.extraFields
};
