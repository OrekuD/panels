import { formatDistance as _formatDistance } from 'date-fns';

const formatDistance = (date: string) => {
	return _formatDistance(new Date(date), new Date(), {
		addSuffix: false
	})
		.replace('less than a minute', 'now')
		.replace('minutes', 'mins')
		.replace('minute', 'min')
		.replace('hours', 'hrs')
		.replace('hour', 'hr')
		.replace('days', 'd')
		.replace('day', 'd')
		.replace('weeks', 'w')
		.replace('week', 'w')
		.replace('about', '');
};

export default formatDistance;
