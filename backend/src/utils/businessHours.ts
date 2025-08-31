import { DateTime } from 'luxon';

export function withinBusinessHours(): boolean {
	const tz = process.env.BUSINESS_HOURS_TZ || 'Asia/Dubai';
	const now = DateTime.now().setZone(tz);
	// Mon=1 ... Sun=7, allowed Mon-Sat (1..6)
	if (now.weekday === 7) return false;
	const hour = now.hour;
	return hour >= 9 && hour < 18;
}