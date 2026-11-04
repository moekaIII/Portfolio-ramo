import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_FORM_ENDPOINT: {
		public: true,
		static: true,
		description:
			'お問い合わせフォームの POST 先 URL。未設定なら site.ts の form.fallbackEndpoint を使用',
		schema: (value) => {
			if (!value) return undefined;
			if (!/^https:\/\//.test(value)) throw new Error('PUBLIC_FORM_ENDPOINT must be an https URL');
			return value;
		}
	}
});
