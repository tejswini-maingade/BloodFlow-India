// Must match the backend's allowed values. The backend validates again, so this only drives the dropdowns.
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const FACILITY_TYPES = [
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'BLOOD_BANK', label: 'Blood bank' },
];

export const typeLabel = (value) =>
  FACILITY_TYPES.find((t) => t.value === value)?.label ?? value;
