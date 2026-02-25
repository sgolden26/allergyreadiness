// Member countries of the Codex Alimentarius Commission (CAC)
// The CAC develops harmonized international food standards, guidelines,
// and codes of practice to protect consumer health and ensure fair food trade.
// Membership indicates a country participates in international food safety standards.

export interface CodexMembers {
  africa: string[];
  asia: string[];
  europe: string[];
  northAmerica: string[];
  southAmerica: string[];
  oceania: string[];
}

export const codexMembers: CodexMembers = {
  africa: [
    "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros",
    "Congo", "Côte d'Ivoire", "Democratic Republic of Congo", "Djibouti",
    "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon",
    "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho",
    "Liberia", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius",
    "Morocco", "Mozambique", "Namibia", "Niger", "Rwanda",
    "Sao Tome and Principe", "Senegal", "Sierra Leone", "Somalia",
    "South Africa", "South Sudan", "Libya", "Sudan", "Togo", "Tunisia",
    "Uganda", "United Republic of Tanzania", "Zambia", "Zimbabwe",
  ],
  asia: [
    "Afghanistan", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan",
    "Brunei Darussalam", "Cambodia", "China",
    "Democratic People's Republic of Korea", "Georgia", "India", "Indonesia",
    "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait",
    "Kyrgyzstan", "Lao People's Democratic Republic", "Lebanon", "Malaysia",
    "Maldives", "Mongolia", "Nepal", "Oman", "Pakistan", "Philippines",
    "Qatar", "Republic of Korea", "Saudi Arabia", "Singapore", "Sri Lanka",
    "Syrian Arab Republic", "Tajikistan", "Thailand", "Turkey",
    "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen",
  ],
  europe: [
    "Albania", "Armenia", "Belarus", "Belgium", "Bosnia and Herzegovina",
    "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia",
    "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland",
    "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Montenegro",
    "Netherlands", "Norway", "Poland", "Portugal", "Republic of Moldova",
    "Romania", "Russian Federation", "San Marino", "Serbia", "Slovakia",
    "Slovenia", "Spain", "Sweden", "Switzerland",
    "The former Yugoslav Republic of Macedonia", "Ukraine", "United Kingdom",
  ],
  northAmerica: [
    "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada",
    "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "El Salvador",
    "Grenada", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico",
    "Nicaragua", "Panama", "St. Kitts and Nevis", "Saint Lucia",
    "Saint Vincent and the Grenadines", "Trinidad and Tobago",
    "United States of America",
  ],
  southAmerica: [
    "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador",
    "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela",
  ],
  oceania: [
    "Australia", "Cook Islands", "Fiji", "Kiribati", "Micronesia", "Nauru",
    "New Zealand", "Papua New Guinea", "Samoa", "Seychelles",
    "Solomon Islands", "Timor-Leste", "Tonga", "Vanuatu",
  ],
};

const memberSet = new Set<string>();
const lowerMemberSet = new Set<string>();

for (const countries of Object.values(codexMembers)) {
  for (const c of countries) {
    memberSet.add(c);
    lowerMemberSet.add(c.toLowerCase());
  }
}

// Common alternate names that Nominatim may return
const aliases: Record<string, string> = {
  "united states": "United States of America",
  "usa": "United States of America",
  "russia": "Russian Federation",
  "south korea": "Republic of Korea",
  "north korea": "Democratic People's Republic of Korea",
  "korea": "Republic of Korea",
  "czechia": "Czech Republic",
  "moldova": "Republic of Moldova",
  "north macedonia": "The former Yugoslav Republic of Macedonia",
  "türkiye": "Turkey",
  "brunei": "Brunei Darussalam",
  "laos": "Lao People's Democratic Republic",
  "syria": "Syrian Arab Republic",
  "tanzania": "United Republic of Tanzania",
  "ivory coast": "Côte d'Ivoire",
  "cote d'ivoire": "Côte d'Ivoire",
  "palestine": "",
  "taiwan": "",
};

export function isCodexMember(country: string): boolean {
  if (!country) return false;
  const lower = country.toLowerCase();
  if (lowerMemberSet.has(lower)) return true;
  const alias = aliases[lower];
  if (alias === "") return false;
  if (alias) return lowerMemberSet.has(alias.toLowerCase());
  return false;
}

export function getCodexMemberCount(): number {
  return memberSet.size;
}
