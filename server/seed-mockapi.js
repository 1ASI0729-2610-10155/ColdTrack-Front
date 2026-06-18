const fs = require('fs');
const path = require('path');

const apiBaseUrl = process.env.MOCKAPI_BASE_URL;

if (!apiBaseUrl) {
  console.error('Set MOCKAPI_BASE_URL, for example: https://xxxxxxxx.mockapi.io/api/v1');
  process.exit(1);
}

const database = JSON.parse(fs.readFileSync(path.join(__dirname, 'mockapi-seed.json'), 'utf8'));

async function listResource(resource) {
  const response = await fetch(`${apiBaseUrl}/${resource}`);

  if (!response.ok) {
    throw new Error(`Could not list ${resource}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function seedResource(resource, records) {
  const currentRecords = await listResource(resource);
  const currentIds = new Set(currentRecords.map(record => String(record.id)));

  for (const record of records) {
    if (currentIds.has(String(record.id))) {
      continue;
    }

    const response = await fetch(`${apiBaseUrl}/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      throw new Error(`Could not create ${resource}/${record.id}: ${response.status} ${response.statusText}`);
    }
  }
}

async function main() {
  for (const [resource, records] of Object.entries(database)) {
    await seedResource(resource, records);
    console.log(`Seeded ${records.length} ${resource}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
