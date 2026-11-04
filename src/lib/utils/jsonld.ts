import { site } from '#lib/config/site.ts';
import { skills } from '#lib/content/profile.ts';
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
		serviceType: skills.map((g) => g.label)
	};
}

export function worksJsonLd(works: WorkMeta[]) {
	return works.map((work) => ({
		'@context': 'https://schema.org',
		'@type': 'CreativeWork',
		name: work.title,
		description: work.summary,
		url: absoluteUrl(`/#works`),
		creator: { '@id': personId },
		keywords: work.tags.join(', '),
		inLanguage: 'ja'
	}));
}
