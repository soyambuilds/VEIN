const { DONATION_GAP_DAYS } = require('./constants');

const CONDITIONS = {
  hivHepatitis: 'HIV, hepatitis B or hepatitis C history',
  chronicIllness: 'Chronic illness such as diabetes on insulin, epilepsy or cancer',
  heartOrBloodDisorder: 'Heart disease or a blood disorder',
  recentSurgery: 'Surgery in the last 6 months',
  recentTattooOrPiercing: 'Tattoo or piercing in the last 6 months',
  recentFever: 'Fever or infection in the last 14 days',
  onAntibiotics: 'Currently taking antibiotics',
  pregnantOrNursing: 'Pregnant or breastfeeding',
  alcoholLast24h: 'Alcohol in the last 24 hours',
};

function ageOn(dob, date = new Date()) {
  if (!dob) return null;
  const d = new Date(dob);
  let age = date.getFullYear() - d.getFullYear();
  const m = date.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && date.getDate() < d.getDate())) age--;
  return age;
}

// Returns the reasons a donor cannot donate. An empty list means eligible.
function checkDonor({ dob, gender, weight, hemoglobin, declaration = {}, lastDonationDate, appointmentDate }) {
  const reasons = [];
  const when = appointmentDate ? new Date(appointmentDate) : new Date();
  const age = ageOn(dob, when);
  if (age === null) reasons.push('Add your date of birth to your profile');
  else if (age < 18 || age > 65) reasons.push('Donors must be between 18 and 65 years old');

  if (!(weight >= 45)) reasons.push('Body weight must be at least 45 kg');
  const minHb = gender === 'male' ? 13 : 12.5;
  if (!(hemoglobin >= minHb)) reasons.push(`Hemoglobin must be at least ${minHb} g/dL`);

  if (lastDonationDate) {
    const next = new Date(lastDonationDate);
    next.setDate(next.getDate() + DONATION_GAP_DAYS);
    if (when < next) reasons.push(`You can donate again from ${next.toISOString().slice(0, 10)}`);
  }
  for (const [key, label] of Object.entries(CONDITIONS)) {
    if (declaration[key] === true) reasons.push(label);
  }
  return reasons;
}

module.exports = { checkDonor, CONDITIONS, ageOn };
