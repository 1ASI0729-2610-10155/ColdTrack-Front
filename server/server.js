const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const dbPath = path.join(__dirname, 'db.js');

/**
 * Loads the database object from db.js without keeping the require cache.
 *
 * @returns {object} Current database state.
 */
function loadDatabase() {
  delete require.cache[require.resolve(dbPath)];
  const databaseFactory = require(dbPath);
  return databaseFactory();
}

/**
 * Persists json-server state back into db.js.
 *
 * @param {object} state - Database state managed by json-server.
 */
function persistDatabase(state) {
  const contents = `/**\n * @summary Fake API seed data for the ColdTrack frontend.\n * @author HackRats\n */\nmodule.exports = () => (${JSON.stringify(state, null, 2)});\n`;
  fs.writeFileSync(dbPath, contents, 'utf8');
}

const router = jsonServer.router(loadDatabase());

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use((request, response, next) => {
  const shouldPersist = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  if (shouldPersist) {
    response.on('finish', () => persistDatabase(router.db.getState()));
  }
  next();
});
server.use(router);

server.listen(3000, () => {
  console.log('ColdTrack fake API is running at http://localhost:3000');
});
