import { site } from '#lib/config/site.ts';
import type { WorkMeta } from '#lib/types/work.ts';
import { absoluteUrl } from './seo.ts';

const personId = `${site.url}/#person`;
const serviceId = `${site.url}/#service`;

export function personJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': personId,
		name: site.author.name,
		alternateName: site.author.nameEn,
		jobTitle: site.author.jobTitle,
		email: `mailto:${site.author.email}`,
		url: site.url,
		address: {
			'@type': 'PostalAddress',
			addressLocality: site.author.location.locality,
			addressCountry: site.author.location.country
		},
		sameAs: site.social.map((s) => s.href),
		knowsAbout: [
			'Frontend Engineering',
			'UI Design',
			'UX Design',
			'Web Performance',
			'Accessibility'
		]
	};
}

export function professionalServiceJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfessionalService',
		'@id': serviceId,
		name: site.name,
		description: site.description,
		url: site.url,
		image: absoluteUrl(site.ogImage),
		email: site.author.email,
		founder: { '@id': personId },
		areaServed: { '@type': 'Country', name: 'Japan' },
		address: {
			'@type': 'PostalAddress',
			addressLocality: site.author.location.locality,
			addressCountry: site.author.location.country
		},
		serviceType: ['フロントエンド開発', 'UIデザイン', 'UX改善', 'デザインシステム構築']
	};
}

export function creativeWorkJsonLd(work: WorkMeta) {
	return [
		{
			'@context': 'https://schema.org',
			'@type': 'CreativeWork',
			name: work.title,
			description: work.summary,
			url: absoluteUrl(`/works/${work.slug}`),
			creator: { '@id': personId },
			keywords: work.tags.join(', '),
			inLanguage: 'ja'
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
				{ '@type': 'ListItem', position: 2, name: 'Works', item: absoluteUrl('/works') },
				{ '@type': 'ListItem', position: 3, name: work.title }
			]
		}
	];
}
