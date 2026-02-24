// Columns:
// World region
// % severe anaphylaxis
// % adrenaline users in the most severe anaphylactic reaction
// % of 3 or more adrenaline users in the most severe anaphylactic reaction
export interface AnaphylaxisData {
  region: string;
  severeAnaphylaxisPct: number;
  adrenalineUsersPct: number;
  threeOrMoreAdrenalinePct: number;
}

export const anaphylaxisPrevalence: AnaphylaxisData[] = [
  { region: "Western Asia",      severeAnaphylaxisPct: 55.83, adrenalineUsersPct: 50.05, threeOrMoreAdrenalinePct: 11.50 },
  { region: "South Africa",      severeAnaphylaxisPct: 50,    adrenalineUsersPct: 56.25, threeOrMoreAdrenalinePct: 6.25  },
  { region: "Western Europe",    severeAnaphylaxisPct: 43,    adrenalineUsersPct: 32.50, threeOrMoreAdrenalinePct: 5.50  },
  { region: "Eastern Europe",    severeAnaphylaxisPct: 41.2,  adrenalineUsersPct: 26.67, threeOrMoreAdrenalinePct: 10.67 },
  { region: "North Africa",      severeAnaphylaxisPct: 40,    adrenalineUsersPct: 13.5,  threeOrMoreAdrenalinePct: 0.50  },
  { region: "North America",     severeAnaphylaxisPct: 39.38, adrenalineUsersPct: 39.67, threeOrMoreAdrenalinePct: 5.17  },
  { region: "South America",     severeAnaphylaxisPct: 39.18, adrenalineUsersPct: 24.97, threeOrMoreAdrenalinePct: 2.50  },
  { region: "Southern Europe",   severeAnaphylaxisPct: 38.64, adrenalineUsersPct: 21.61, threeOrMoreAdrenalinePct: 2.50  },
  { region: "Oceania",           severeAnaphylaxisPct: 35,    adrenalineUsersPct: 27.50, threeOrMoreAdrenalinePct: 3.00  },
  { region: "Northern Europe",   severeAnaphylaxisPct: 32.9,  adrenalineUsersPct: 13.67, threeOrMoreAdrenalinePct: 1.67  },
  { region: "Eastern Asia",      severeAnaphylaxisPct: 30.5,  adrenalineUsersPct: 47.50, threeOrMoreAdrenalinePct: 7.50  },
  { region: "Southern Asia",     severeAnaphylaxisPct: 30,    adrenalineUsersPct: 3.33,  threeOrMoreAdrenalinePct: 0     },
  { region: "Central America",   severeAnaphylaxisPct: 21.72, adrenalineUsersPct: 24.47, threeOrMoreAdrenalinePct: 5.33  },
  { region: "South-Eastern Asia",severeAnaphylaxisPct: 12.5,  adrenalineUsersPct: 12.50, threeOrMoreAdrenalinePct: 0     },
];
