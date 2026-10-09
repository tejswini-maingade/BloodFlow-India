// The database enum uses A_POS; the API and UI use "A+".
const TO_API = {
  A_POS: 'A+', A_NEG: 'A-',
  B_POS: 'B+', B_NEG: 'B-',
  AB_POS: 'AB+', AB_NEG: 'AB-',
  O_POS: 'O+', O_NEG: 'O-',
};

const TO_DB = Object.fromEntries(Object.entries(TO_API).map(([db, api]) => [api, db]));

module.exports = {
  API_GROUPS: Object.values(TO_API),
  toApi: (dbValue) => TO_API[dbValue],
  toDb: (apiValue) => TO_DB[apiValue],
};
