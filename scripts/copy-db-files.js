/* eslint-disable no-console */
require('dotenv').config();
const fse = require('fs-extra');
const path = require('path');
const del = require('del');

function getDatabaseType(url = process.env.DATABASE_URL) {
  let type = process.env.DATABASE_TYPE || (url && url.split(':')[0]);

  if (type === 'postgres') type = 'postgresql';

  if (type === 'coachroachdb' || (type === 'postgresql' && url?.includes('cockroachlabs.cloud'))) {
    type = 'cockroachdb';
  }

  return type;
}

const databaseType = getDatabaseType();

if (!databaseType || !['mysql', 'postgresql', 'cockroachdb'].includes(databaseType)) {
  throw new Error('Missing or invalid database');
}

console.log(`Database type detected: ${databaseType}`);

const src = path.resolve(__dirname, `../db/${databaseType}`);
const dest = path.resolve(__dirname, '../prisma');

del.sync(dest);

fse.copySync(src, dest);

console.log(`Copied ${src} to ${dest}`);
