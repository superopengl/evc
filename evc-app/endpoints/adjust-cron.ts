import AWS from 'aws-sdk';
import moment from 'moment-timezone';
import { start } from './jobStarter';
import _ from 'lodash';

AWS.config.update({ region: 'us-east-1' });
const cloudwatchevents = new AWS.CloudWatchEvents();

const NY_TIMEZONE = 'America/New_York';
const UTC_TIMEZONE = 'UTC'

/**
 * The cron to trigger this task should be
 *  In March, the second Sunday 03:10 New York time => 07:10 UTC time
 *      cron(10 7 ? MAR 1#2 *)
 * 
 *  In November, the first Sunday 01:10 New York time => 05:10 UTC time
 *      cron(10 5 ? NOV 1#1 *)
 */

const defs = [
    {
        name: 'daily-earnings-calendar',
        description: 'Daily earnings calendar',
        minute: '30',
        hourNY: '0,13',
        daysOfWeek: 'MON-FRI',
        // AlphaVantage
    },
    {
        name: 'daily-close',
        description: 'Daily close',
        minute: '30',
        hourNY: '0,4,16,20',
        daysOfWeek: 'MON-SAT',
    },
    {
        name: 'daily-putcall',
        description: 'Daily adcanced stats info',
        minute: '10',
        hourNY: '16',
        daysOfWeek: 'MON-FRI',
    },
    {
        name: 'daily-subscription',
        description: 'Daily subscription check',
        minute: '0',
        hourNY: '23',
        daysOfWeek: '*',
    },
    {
        name: 'daily-insider',
        description: 'Daily insider transaction',
        minute: '0',
        hourNY: '3',
        daysOfWeek: 'MON-FRI',
    },
    {
        name: 'daily-uoa',
        description: 'Daily uoa fetch',
        minute: '*/5',
        hourNY: '9-17',
        daysOfWeek: 'MON-FRI',
    },
    {
        name: 'daily-opc-history',
        description: 'Daily option putcall history fetch',
        minute: '20',
        hourNY: '16',
        daysOfWeek: 'MON-FRI',
    },
];

function convertNyHourToUtcHour(hourNY) {
    return hourNY.split(/([-,])/).map(t => {
        if (/^[0-9]+$/.test(t)) {
            return moment.tz(t, 'H', NY_TIMEZONE).tz(UTC_TIMEZONE).format('H');
        } else {
            return t;
        }
    }).join('');
}

function getDescription(data) {
    const { description, hourNY } = data;
    return `${description} at New York time ${hourNY}`;
}

function getCronInUtcTime(minute, hourNY, daysOfWeek) {
    const hourUtc = convertNyHourToUtcHour(hourNY);
    return `cron(${minute} ${hourUtc} ? * ${daysOfWeek} *)`;
}

function getRuleParams(data) {
    return {
        Name: data.name,
        Description: getDescription(data),
        ScheduleExpression: getCronInUtcTime(data.minute, data.hourNY, data.daysOfWeek),
        State: 'ENABLED',
        RoleArn: 'arn:aws:iam::115607939215:role/ecsEventsRole',
    };
}

async function updateEventRule(cloudwatchevents, def) {
    const params = getRuleParams(def);
    console.log(def.name, 'params', params);
    return new Promise((res, rej) => {
        cloudwatchevents.putRule(params, (err, data) => {
            if (err) {
                return rej(err);
            }
            res(data);
        });
    })
}

const JOB_NAME = 'adjust-cron';

start(JOB_NAME, async () => {
    for (const def of defs) {
        try {
            await updateEventRule(cloudwatchevents, def)
            console.log(def.name, 'done');
        } catch (e) {
            console.error(def.name, 'error', e);
        }
    }
});

