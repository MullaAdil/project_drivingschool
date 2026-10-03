/* ==========================================================================
   20-DAY PROGRESSIVE DRIVING TRAINING CURRICULUM
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH
   
   Divided strictly into 3 Progressive Stages:
   - Days 1–10: Stage 1 · Basic Driving
   - Days 11–15: Stage 2 · Intermediate Driving (Circles, Speed & Road Maneuvers)
   - Days 16–20: Stage 3 · Final Assessment & Parking (8-Track, H-Bay & DL Test)
   ========================================================================== */

export const CURRICULUM_STAGES = [
  {
    key: 'stage1',
    name: 'Stage 1: Basic Driving',
    shortName: 'Basic Driving',
    daysLabel: 'Days 1–10',
    dayRange: [1, 10],
    focus: 'Vehicle controls, steering, starting, stopping, turns & road basics'
  },
  {
    key: 'stage2',
    name: 'Stage 2: Intermediate Driving',
    shortName: 'Intermediate Driving',
    daysLabel: 'Days 11–15',
    dayRange: [11, 15],
    focus: 'Traffic circles, speed control, progressive gears & road maneuvers'
  },
  {
    key: 'stage3',
    name: 'Stage 3: Final Assessment & Parking',
    shortName: 'Final Test & Parking',
    daysLabel: 'Days 16–20',
    dayRange: [16, 20],
    focus: 'Parallel/slope parking, RTO 8-Track, H-Track, and final driving test'
  }
];

export function getStageForDay(dayNumber) {
  if (dayNumber <= 10) return CURRICULUM_STAGES[0];
  if (dayNumber <= 15) return CURRICULUM_STAGES[1];
  return CURRICULUM_STAGES[2];
}

// 20-Day Official Practical Syllabus
export const OFFICIAL_20_DAY_CURRICULUM = [
  // ----------------------------------------------------
  // DAYS 1–10 — BASIC / SIMPLE DRIVING
  // ----------------------------------------------------
  {
    day: 1,
    stageKey: 'stage1',
    stageName: 'Stage 1: Basic Driving',
    objective: 'Vehicle Introduction',
    skills: [
      'Vehicle controls',
      'Steering',
      'Brakes',
      'Accelerator',
      'Mirrors',
      'Seat adjustment',
      'Basic safety',
      'Starting and stopping',
      'Basic straight-line driving'
    ],
    route: {
      title: 'Academy Training Depot & Ground Straightaway',
      startPoint: { name: 'Gafoor Driving Academy Depot, Pulivendula', lat: 14.4230, lng: 78.2285 },
      endPoint: { name: 'Bakarapuram Training Field', lat: 14.4312, lng: 78.2361 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Cockpit Drill & ABC Orientation', lat: 14.4230, lng: 78.2285 },
        { name: 'Straight-line Acceleration Test', lat: 14.4265, lng: 78.2315 },
        { name: 'Progressive Stop Box Line', lat: 14.4312, lng: 78.2361 }
      ],
      path: [
        [14.4230, 78.2285],
        [14.4242, 78.2295],
        [14.4255, 78.2308],
        [14.4265, 78.2315],
        [14.4280, 78.2330],
        [14.4295, 78.2345],
        [14.4312, 78.2361]
      ]
    }
  },
  {
    day: 2,
    stageKey: 'stage1',
    stageName: 'Stage 1: Basic Driving',
    objective: 'Steering & Vehicle Control',
    skills: [
      'Steering control',
      'Maintaining lane position',
      'Smooth acceleration',
      'Smooth braking',
      'Basic road awareness'
    ],
    route: {
      title: 'Bakarapuram Avenues & Lane Discipline Corridor',
      startPoint: { name: 'Bakarapuram Practice Field', lat: 14.4312, lng: 78.2361 },
      endPoint: { name: 'Pulivendula North Outer Avenue', lat: 14.4380, lng: 78.2290 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Hand-over-hand steering rhythm zone', lat: 14.4325, lng: 78.2340 },
        { name: 'Centering between painted road lines', lat: 14.4350, lng: 78.2315 },
        { name: 'Controlled smooth threshold braking stop', lat: 14.4380, lng: 78.2290 }
      ],
      path: [
        [14.4312, 78.2361],
        [14.4325, 78.2340],
        [14.4338, 78.2325],
        [14.4350, 78.2315],
        [14.4365, 78.2302],
        [14.4380, 78.2290]
      ]
    }
  },
  {
    day: 3,
    stageKey: 'stage1',
    stageName: 'Stage 1: Basic Driving',
    objective: 'Starting, Stopping & Control',
    skills: [
      'Smooth starts',
      'Controlled stops',
      'Brake control',
      'Accelerator control',
      'Maintaining safe distance'
    ],
    route: {
      title: 'Pulivendula Residential Boulevard Start-Stop Circuit',
      startPoint: { name: 'Pulivendula North Outer Avenue', lat: 14.4380, lng: 78.2290 },
      endPoint: { name: 'Bakarapuram Crossroad Depot', lat: 14.4270, lng: 78.2340 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Gradual throttle roll-on point', lat: 14.4360, lng: 78.2300 },
        { name: '3-second buffer distance following drill', lat: 14.4310, lng: 78.2320 },
        { name: 'Zero-jolt stopping mark', lat: 14.4270, lng: 78.2340 }
      ],
      path: [
        [14.4380, 78.2290],
        [14.4360, 78.2300],
        [14.4335, 78.2310],
        [14.4310, 78.2320],
        [14.4290, 78.2330],
        [14.4270, 78.2340]
      ]
    }
  },
  {
    day: 4,
    stageKey: 'stage1',
    stageName: 'Stage 1: Basic Driving',
    objective: 'Basic Road Driving',
    skills: [
      'Driving on normal roads',
      'Lane discipline',
      'Mirrors',
      'Indicators',
      'Basic traffic awareness'
    ],
    route: {
      title: 'Bakarapuram to JNTU Pulivendula Link Road',
      startPoint: { name: 'Bakarapuram Crossroad Depot', lat: 14.4270, lng: 78.2340 },
      endPoint: { name: 'JNTU Campus South Gate', lat: 14.4410, lng: 78.2160 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Left mirror & indicator sweep', lat: 14.4300, lng: 78.2300 },
        { name: 'Pedestrian crossing yield zone', lat: 14.4350, lng: 78.2230 },
        { name: 'JNTU link lane discipline check', lat: 14.4410, lng: 78.2160 }
      ],
      path: [
        [14.4270, 78.2340],
        [14.4300, 78.2300],
        [14.4330, 78.2260],
        [14.4350, 78.2230],
        [14.4380, 78.2190],
        [14.4410, 78.2160]
      ]
    }
  },
  {
    day: 5,
    stageKey: 'stage1',
    stageName: 'Stage 1: Basic Driving',
    objective: 'Turns',
    skills: [
      'Left turns',
      'Right turns',
      'Proper indicators',
      'Mirror checking',
      'Positioning before turns'
    ],
    route: {
      title: 'Town Grid Turn Maneuver Circuit (30m Rule)',
      startPoint: { name: 'JNTU Campus South Gate', lat: 14.4410, lng: 78.2160 },
      endPoint: { name: 'Town Central Square Junction', lat: 14.4250, lng: 78.2270 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Sharp 90° Left turn with curbside clearance', lat: 14.4370, lng: 78.2190 },
        { name: 'Center lane positioning before right turn', lat: 14.4310, lng: 78.2230 },
        { name: 'Mirror-Signal-Maneuver verification', lat: 14.4250, lng: 78.2270 }
      ],
      path: [
        [14.4410, 78.2160],
        [14.4370, 78.2190],
        [14.4340, 78.2210],
        [14.4310, 78.2230],
        [14.4280, 78.2250],
        [14.4250, 78.2270]
      ]
    }
  },
  {
    day: 6,
    stageKey: 'stage1',
    stageName: 'Stage 1: Basic Driving',
    objective: 'Traffic Practice',
    skills: [
      'Driving in moderate traffic',
      'Following vehicles',
      'Maintaining distance',
      'Basic intersections'
    ],
    route: {
      title: 'Pulivendula Main Road Moderate Flow Practice',
      startPoint: { name: 'Town Central Square Junction', lat: 14.4250, lng: 78.2270 },
      endPoint: { name: 'RTC Bus Stand Approach Corridor', lat: 14.4190, lng: 78.2320 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Two-wheeler scanning & gap judgment', lat: 14.4240, lng: 78.2280 },
        { name: 'Auto-rickshaw overtaking avoidance', lat: 14.4215, lng: 78.2300 },
        { name: 'Buffer stop behind commercial buses', lat: 14.4190, lng: 78.2320 }
      ],
      path: [
        [14.4250, 78.2270],
        [14.4240, 78.2280],
        [14.4225, 78.2290],
        [14.4215, 78.2300],
        [14.4200, 78.2310],
        [14.4190, 78.2320]
      ]
    }
  },
  {
    day: 7,
    stageKey: 'stage1',
    stageName: 'Stage 1: Basic Driving',
    objective: 'Junctions & Crossroads',
    skills: [
      'Intersections',
      'Giving way',
      'Turning at junctions',
      'Reading traffic movement'
    ],
    route: {
      title: 'Municipal Crossroads & Right-of-Way Intersection',
      startPoint: { name: 'RTC Bus Stand Approach Corridor', lat: 14.4190, lng: 78.2320 },
      endPoint: { name: 'Bypass T-Junction Checkpoint', lat: 14.4140, lng: 78.2410 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: '4-Way Stop line priority judgment', lat: 14.4180, lng: 78.2340 },
        { name: 'Giving way to oncoming traffic', lat: 14.4160, lng: 78.2375 },
        { name: 'T-Junction safe entry insertion', lat: 14.4140, lng: 78.2410 }
      ],
      path: [
        [14.4190, 78.2320],
        [14.4180, 78.2340],
        [14.4170, 78.2360],
        [14.4160, 78.2375],
        [14.4150, 78.2395],
        [14.4140, 78.2410]
      ]
    }
  },
  {
    day: 8,
    stageKey: 'stage1',
    stageName: 'Stage 1: Basic Driving',
    objective: 'Parking Basics',
    skills: [
      'Basic parking',
      'Positioning the vehicle',
      'Reverse movement',
      'Mirror usage'
    ],
    route: {
      title: 'Academy Ground Bay Docking & Angle Parking Grid',
      startPoint: { name: 'Bypass T-Junction Checkpoint', lat: 14.4140, lng: 78.2410 },
      endPoint: { name: 'Academy Parking Training Ground', lat: 14.4210, lng: 78.2120 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Curbside parallel line positioning', lat: 14.4170, lng: 78.2300 },
        { name: '45-degree angle bay entry', lat: 14.4190, lng: 78.2200 },
        { name: 'Reverse mirror sweep parking alignment', lat: 14.4210, lng: 78.2120 }
      ],
      path: [
        [14.4140, 78.2410],
        [14.4160, 78.2350],
        [14.4170, 78.2300],
        [14.4185, 78.2250],
        [14.4190, 78.2200],
        [14.4200, 78.2150],
        [14.4210, 78.2120]
      ]
    }
  },
  {
    day: 9,
    stageKey: 'stage1',
    stageName: 'Stage 1: Basic Driving',
    objective: 'Reverse & Maneuvering',
    skills: [
      'Reverse driving',
      'Reverse parking',
      'Vehicle positioning',
      'Steering while reversing'
    ],
    route: {
      title: 'Reverse Bay Precision Track & Tight Turnaround',
      startPoint: { name: 'Academy Parking Training Ground', lat: 14.4210, lng: 78.2120 },
      endPoint: { name: 'RTO H-Track Test Facility Boundary', lat: 14.4180, lng: 78.2090 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Straight-line 50m reverse creeping', lat: 14.4205, lng: 78.2110 },
        { name: 'Reverse left corner rounding with side mirror', lat: 14.4195, lng: 78.2100 },
        { name: 'Centering in H-Track reverse dock', lat: 14.4180, lng: 78.2090 }
      ],
      path: [
        [14.4210, 78.2120],
        [14.4205, 78.2110],
        [14.4198, 78.2105],
        [14.4195, 78.2100],
        [14.4188, 78.2095],
        [14.4180, 78.2090]
      ]
    }
  },
  {
    day: 10,
    stageKey: 'stage1',
    stageName: 'Stage 1: Basic Driving',
    objective: 'Basic Driving Assessment',
    skills: [
      'Combine all previous skills',
      'Normal road driving',
      'Turns',
      'Parking',
      'Reversing',
      'Traffic awareness'
    ],
    route: {
      title: 'Stage 1 Comprehensive Basic Evaluation Circuit',
      startPoint: { name: 'RTO H-Track Test Facility Boundary', lat: 14.4180, lng: 78.2090 },
      endPoint: { name: 'Gafoor Driving Academy Depot, Pulivendula', lat: 14.4230, lng: 78.2285 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Stage 1 Skills Assessment Start', lat: 14.4180, lng: 78.2090 },
        { name: 'Town traffic & turning evaluation', lat: 14.4200, lng: 78.2180 },
        { name: 'Reverse bay test & final docking check', lat: 14.4230, lng: 78.2285 }
      ],
      path: [
        [14.4180, 78.2090],
        [14.4190, 78.2140],
        [14.4200, 78.2180],
        [14.4215, 78.2230],
        [14.4225, 78.2260],
        [14.4230, 78.2285]
      ]
    }
  },

  // ----------------------------------------------------
  // DAYS 11–14 — CIRCLES / RING ROADS / BUSIER ROADS
  // ----------------------------------------------------
  {
    day: 11,
    stageKey: 'stage2',
    stageName: 'Stage 2: Intermediate Driving',
    objective: 'Circular Roads',
    skills: [
      'Entering a traffic circle',
      'Lane positioning',
      'Giving way',
      'Safe exit'
    ],
    route: {
      title: 'Clock Tower Traffic Circle & Roundabout Ingress',
      startPoint: { name: 'Academy Depot, Pulivendula', lat: 14.4230, lng: 78.2285 },
      endPoint: { name: 'Clock Tower Junction East Gate', lat: 14.4260, lng: 78.2380 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Traffic circle approach & decelerate', lat: 14.4240, lng: 78.2320 },
        { name: 'Yield to traffic already in the circle', lat: 14.4250, lng: 78.2350 },
        { name: 'Clockwise arc navigation & left exit indicator', lat: 14.4260, lng: 78.2380 }
      ],
      path: [
        [14.4230, 78.2285],
        [14.4238, 78.2305],
        [14.4245, 78.2330],
        [14.4252, 78.2355],
        [14.4258, 78.2370],
        [14.4260, 78.2380]
      ]
    }
  },
  {
    day: 12,
    stageKey: 'stage2',
    stageName: 'Stage 2: Intermediate Driving',
    objective: 'Larger Traffic Circles',
    skills: [
      'Multi-lane circles',
      'Choosing the correct lane',
      'Indicators',
      'Maintaining awareness'
    ],
    route: {
      title: 'Shilparamam Multi-Lane Circle & Arterial Roundabout',
      startPoint: { name: 'Clock Tower Junction East Gate', lat: 14.4260, lng: 78.2380 },
      endPoint: { name: 'Shilparamam Ring Junction', lat: 14.4320, lng: 78.2510 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Lane selection for 2nd exit vs 3rd exit', lat: 14.4280, lng: 78.2420 },
        { name: 'Inner-lane to outer-lane transition mirror check', lat: 14.4300, lng: 78.2460 },
        { name: 'Clear exit indicator without cutting off', lat: 14.4320, lng: 78.2510 }
      ],
      path: [
        [14.4260, 78.2380],
        [14.4275, 78.2405],
        [14.4288, 78.2435],
        [14.4302, 78.2465],
        [14.4312, 78.2490],
        [14.4320, 78.2510]
      ]
    }
  },
  {
    day: 13,
    stageKey: 'stage2',
    stageName: 'Stage 2: Intermediate Driving',
    objective: 'Ring Roads / Main Roads',
    skills: [
      'Higher-traffic roads',
      'Maintaining speed',
      'Lane discipline',
      'Merging',
      'Safe overtaking awareness'
    ],
    route: {
      title: 'Pulivendula Outer Ring Road 4-Lane High-Speed Sector',
      startPoint: { name: 'Shilparamam Ring Junction', lat: 14.4320, lng: 78.2510 },
      endPoint: { name: 'Kadapa-Pulivendula Highway Cloverleaf', lat: 14.4420, lng: 78.2630 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Acceleration lane speed match merge', lat: 14.4345, lng: 78.2540 },
        { name: 'Cruising at 50 km/h with lane centering', lat: 14.4380, lng: 78.2580 },
        { name: 'Heavy vehicle blind-spot sweep & safe buffer', lat: 14.4420, lng: 78.2630 }
      ],
      path: [
        [14.4320, 78.2510],
        [14.4345, 78.2540],
        [14.4370, 78.2570],
        [14.4395, 78.2600],
        [14.4410, 78.2618],
        [14.4420, 78.2630]
      ]
    }
  },
  {
    day: 14,
    stageKey: 'stage2',
    stageName: 'Stage 2: Intermediate Driving',
    objective: 'Combined Traffic Practice',
    skills: [
      'Circles',
      'Main roads',
      'Junctions',
      'Traffic',
      'Lane changes',
      'Navigation awareness'
    ],
    route: {
      title: 'Outer Ring to Town Core Integrated Traffic Loop',
      startPoint: { name: 'Kadapa-Pulivendula Highway Cloverleaf', lat: 14.4420, lng: 78.2630 },
      endPoint: { name: 'Academy Depot, Pulivendula', lat: 14.4230, lng: 78.2285 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Deceleration ramp speed moderation', lat: 14.4380, lng: 78.2550 },
        { name: 'Multi-stage lane changes in live traffic', lat: 14.4310, lng: 78.2430 },
        { name: 'Town roundabout to depot approach', lat: 14.4230, lng: 78.2285 }
      ],
      path: [
        [14.4420, 78.2630],
        [14.4380, 78.2550],
        [14.4340, 78.2480],
        [14.4310, 78.2430],
        [14.4270, 78.2350],
        [14.4230, 78.2285]
      ]
    }
  },

  // ----------------------------------------------------
  // DAYS 15–17 — GEARS & ADVANCED VEHICLE CONTROL
  // ----------------------------------------------------
  {
    day: 15,
    stageKey: 'stage2',
    stageName: 'Stage 2: Intermediate Driving',
    objective: 'Gear Fundamentals',
    skills: [
      'Gear positions',
      'Clutch control',
      'Gear changes',
      'First gear',
      'Second gear',
      'Smooth shifting'
    ],
    autoObjective: 'Drive Modes & Throttle Control',
    autoSkills: [
      'Transmission modes (P/R/N/D/S)',
      'Brake pedal engagement safety',
      'Creep control without throttle',
      'Smooth progressive throttle roll-on',
      'Left-foot rest discipline'
    ],
    route: {
      title: 'Clutch Modulation & 1st-to-2nd Gear Shift Corridor',
      startPoint: { name: 'Academy Depot, Pulivendula', lat: 14.4230, lng: 78.2285 },
      endPoint: { name: 'Bakarapuram Straight Runway', lat: 14.4330, lng: 78.2380 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Biting point discovery on 0° flat', lat: 14.4245, lng: 78.2310 },
        { name: '1st gear roll-off without engine stall', lat: 14.4280, lng: 78.2340 },
        { name: 'Clutch-depress & 2nd gear smooth slot-in', lat: 14.4330, lng: 78.2380 }
      ],
      path: [
        [14.4230, 78.2285],
        [14.4245, 78.2310],
        [14.4265, 78.2328],
        [14.4280, 78.2340],
        [14.4305, 78.2360],
        [14.4330, 78.2380]
      ]
    }
  },
  {
    day: 16,
    stageKey: 'stage3',
    stageName: 'Stage 3: Final Assessment & Parking',
    objective: 'Gear Changes During Driving',
    skills: [
      'Upshifting',
      'Downshifting',
      'Matching speed with gear',
      'Clutch control',
      'Avoiding jerky movements'
    ],
    autoObjective: 'Dynamic Speed Regulation & Kickdown Dynamics',
    autoSkills: [
      'Engine braking regulation',
      'Progressive braking without sudden lock',
      'Kickdown passing acceleration',
      'Speed anticipation and coasting',
      'Zero-jerk speed transitions'
    ],
    route: {
      title: 'Progressive Upshift & Downshift Road Sector (Gears 2-3-4)',
      startPoint: { name: 'Bakarapuram Straight Runway', lat: 14.4330, lng: 78.2380 },
      endPoint: { name: 'Pulivendula Bypass Incline Bridge', lat: 14.4170, lng: 78.2480 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Upshifting to 3rd gear at 30 km/h', lat: 14.4290, lng: 78.2410 },
        { name: 'Upshifting to 4th gear cruising at 45 km/h', lat: 14.4230, lng: 78.2440 },
        { name: 'Engine rev-match downshift from 4th to 2nd before turn', lat: 14.4170, lng: 78.2480 }
      ],
      path: [
        [14.4330, 78.2380],
        [14.4290, 78.2410],
        [14.4260, 78.2425],
        [14.4230, 78.2440],
        [14.4200, 78.2460],
        [14.4170, 78.2480]
      ]
    }
  },
  {
    day: 17,
    stageKey: 'stage3',
    stageName: 'Stage 3: Final Assessment & Parking',
    objective: 'Advanced Gear Practice',
    skills: [
      'Gear selection in traffic',
      'Gear selection on turns',
      'Slow-speed control',
      'Stop-and-go traffic',
      'Smooth clutch + accelerator coordination'
    ],
    autoObjective: 'Incline Hold & Heavy Traffic Crawl Management',
    autoSkills: [
      'Hill hold assist coordination',
      'Stop-and-go crawl speed fine control',
      'Throttle modulation on tight radius turns',
      'Low traction crawling stability',
      'Parking pawl safety engagement'
    ],
    route: {
      title: 'Pulivendula Ghat Incline & Heavy Bumper Crawl Zone',
      startPoint: { name: 'Pulivendula Bypass Incline Bridge', lat: 14.4170, lng: 78.2480 },
      endPoint: { name: 'Vempalli Road Market Square', lat: 14.4110, lng: 78.2310 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Half-clutch hill hold without rollback (8° grade)', lat: 14.4150, lng: 78.2440 },
        { name: 'Slow 1st gear creeping in crowded bazaar', lat: 14.4130, lng: 78.2380 },
        { name: 'Zero-stall stop-and-go pedal coordination', lat: 14.4110, lng: 78.2310 }
      ],
      path: [
        [14.4170, 78.2480],
        [14.4150, 78.2440],
        [14.4140, 78.2410],
        [14.4130, 78.2380],
        [14.4120, 78.2345],
        [14.4110, 78.2310]
      ]
    }
  },

  // ----------------------------------------------------
  // DAYS 18–20 — FULL ROAD / FINAL TRAINING
  // ----------------------------------------------------
  {
    day: 18,
    stageKey: 'stage3',
    stageName: 'Stage 3: Final Assessment & Parking',
    objective: 'Full Traffic Drive',
    skills: [
      'Normal city roads',
      'Junctions',
      'Traffic circles',
      'Main roads',
      'Parking',
      'Reversing',
      'Gear control'
    ],
    route: {
      title: 'Pulivendula Full City Master Integration Route',
      startPoint: { name: 'Vempalli Road Market Square', lat: 14.4110, lng: 78.2310 },
      endPoint: { name: 'Town Central Commercial Hub', lat: 14.4250, lng: 78.2280 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Busy market street traversal', lat: 14.4150, lng: 78.2300 },
        { name: 'Ring road merge & high-speed section', lat: 14.4200, lng: 78.2400 },
        { name: 'Full city intersection & bay park docking', lat: 14.4250, lng: 78.2280 }
      ],
      path: [
        [14.4110, 78.2310],
        [14.4150, 78.2300],
        [14.4180, 78.2350],
        [14.4200, 78.2400],
        [14.4230, 78.2340],
        [14.4250, 78.2280]
      ]
    }
  },
  {
    day: 19,
    stageKey: 'stage3',
    stageName: 'Stage 3: Final Assessment & Parking',
    objective: 'Independent Driving Practice',
    skills: [
      'Student performs most tasks independently',
      'Instructor supervises',
      'Navigation practice',
      'Lane changes',
      'Traffic decisions',
      'Parking',
      'Road awareness'
    ],
    route: {
      title: 'Solo Student Practice Run (Instructor Co-Pilot)',
      startPoint: { name: 'Town Central Commercial Hub', lat: 14.4250, lng: 78.2280 },
      endPoint: { name: 'Pulivendula RTO Automated Test Center Gate', lat: 14.4200, lng: 78.2100 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'Student self-directed navigation decision', lat: 14.4270, lng: 78.2240 },
        { name: 'Unprompted mirror checks & lane discipline', lat: 14.4240, lng: 78.2170 },
        { name: 'Autonomous curbside parking & reverse bay docking', lat: 14.4200, lng: 78.2100 }
      ],
      path: [
        [14.4250, 78.2280],
        [14.4270, 78.2240],
        [14.4260, 78.2200],
        [14.4240, 78.2170],
        [14.4220, 78.2130],
        [14.4200, 78.2100]
      ]
    }
  },
  {
    day: 20,
    stageKey: 'stage3',
    stageName: 'Stage 3: Final Assessment & Parking',
    objective: 'Final Driving Assessment',
    skills: [
      'Complete road drive',
      'Vehicle control',
      'Traffic handling',
      'Turns',
      'Circles',
      'Ring/main roads',
      'Gear control',
      'Parking',
      'Reversing',
      'Overall driving confidence'
    ],
    route: {
      title: 'Official AP RTO Track Rehearsal & Graduation Exam',
      startPoint: { name: 'Pulivendula RTO Automated Test Center Gate', lat: 14.4200, lng: 78.2100 },
      endPoint: { name: 'Gafoor Driving Academy Depot (Graduation)', lat: 14.4230, lng: 78.2285 },
      distanceKm: 8.0,
      durationMins: 60,
      waypoints: [
        { name: 'RTO 8-Track automated sensor simulation', lat: 14.4190, lng: 78.2090 },
        { name: 'H-Track perpendicular bay docking pass', lat: 14.4180, lng: 78.2085 },
        { name: 'Final road test pass & graduation award', lat: 14.4230, lng: 78.2285 }
      ],
      path: [
        [14.4200, 78.2100],
        [14.4190, 78.2090],
        [14.4180, 78.2085],
        [14.4195, 78.2140],
        [14.4215, 78.2210],
        [14.4230, 78.2285]
      ]
    }
  }
];

export function getCurriculumDay(dayNumber, transmission = 'manual') {
  const item = OFFICIAL_20_DAY_CURRICULUM.find(c => c.day === dayNumber) || OFFICIAL_20_DAY_CURRICULUM[0];
  if (transmission === 'automatic' && item.autoObjective) {
    return {
      ...item,
      objective: item.autoObjective,
      skills: item.autoSkills
    };
  }
  return item;
}
