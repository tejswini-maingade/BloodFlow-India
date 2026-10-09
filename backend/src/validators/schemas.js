const { z } = require('zod');
const config = require('../config');
const { API_GROUPS } = require('../utils/bloodGroups');
const { RISK_LEVELS } = require('../services/riskService');

const bloodGroup = z.enum(API_GROUPS, {
  errorMap: (issue, ctx) => ({
    message: ctx.data === undefined ? 'bloodGroup is required' : 'Invalid blood group',
  }),
});

const units = z
  .number({
    required_error: 'unitsAvailable is required',
    invalid_type_error: 'unitsAvailable must be a number',
  })
  .int('unitsAvailable must be a whole number')
  .min(0, 'unitsAvailable cannot be negative')
  .max(config.maxUnits, `unitsAvailable cannot exceed ${config.maxUnits}`);

// .strict() rejects unexpected fields, so clients can't sneak extra data in.
const createInventory = z
  .object({
    facilityId: z
      .number({ required_error: 'facilityId is required', invalid_type_error: 'facilityId must be a number' })
      .int('facilityId must be a whole number')
      .positive('facilityId must be positive'),
    bloodGroup,
    unitsAvailable: units,
  })
  .strict();

const updateInventory = z.object({ unitsAvailable: units }).strict();

const idParam = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'id must be a number' })
    .int('id must be a whole number')
    .positive('id must be positive'),
});

// In a URL, "+" decodes to a space ("?bloodGroup=O+" arrives as "O "). Blood groups
// never contain spaces, so a space here can only be a "+" that was not encoded.
const queryBloodGroup = z.preprocess(
  (v) => (typeof v === 'string' ? v.replace(/ /g, '+') : v),
  bloodGroup.optional()
);

const listQuery = z.object({
  bloodGroup: queryBloodGroup,
  city: z.string().trim().min(1, 'city cannot be empty').max(80).optional(),
  risk: z.enum(RISK_LEVELS, { errorMap: () => ({ message: 'Invalid risk level' }) }).optional(),
});

const login = z.object({
  email: z
    .string({ required_error: 'email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email')
    .max(150),
  password: z
    .string({ required_error: 'password is required' })
    .min(1, 'password is required')
    .max(200),
});

module.exports = { createInventory, updateInventory, idParam, listQuery, login };
