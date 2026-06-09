import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { PrismaClient, TravelStyle, TripType, BudgetRange, MemberRole, JoinRequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchDestinationImage(destination: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  const place = destination.split(/[,→]/)[0].trim();
  const query = encodeURIComponent(`${place} travel`);
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${key}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return null;
    const json = await res.json() as { urls?: { regular?: string } };
    return json.urls?.regular ?? null;
  } catch {
    return null;
  }
}

const USERS = [
  { name: 'Aditya Sharma', email: 'aditya@example.com', username: 'aditya_travels', city: 'Mumbai', country: 'India', travelStyle: TravelStyle.BACKPACKER, bio: 'Always chasing sunsets 🌅 | 25 countries down' },
  { name: 'Priya Patel', email: 'priya@example.com', username: 'priya_explores', city: 'Bengaluru', country: 'India', travelStyle: TravelStyle.SOLO, bio: 'Solo traveler, coffee addict, trail runner' },
  { name: 'Rahul Mehta', email: 'rahul@example.com', username: 'rahul_roams', city: 'Delhi', country: 'India', travelStyle: TravelStyle.ROAD_TRIPPER, bio: 'Road trips > flights. Bike, car, whatever.' },
  { name: 'Sneha Kapoor', email: 'sneha@example.com', username: 'sneha_nomad', city: 'Pune', country: 'India', travelStyle: TravelStyle.DIGITAL_NOMAD, bio: 'Remote work + travel = life' },
  { name: 'Vikram Nair', email: 'vikram@example.com', username: 'vikram_adventure', city: 'Kochi', country: 'India', travelStyle: TravelStyle.BACKPACKER, bio: 'Trekker, diver, paraglider. Mountains are home.' },
  { name: 'Ananya Singh', email: 'ananya@example.com', username: 'ananya_world', city: 'Hyderabad', country: 'India', travelStyle: TravelStyle.LUXURY, bio: 'Curated experiences, boutique hotels, fine dining' },
  { name: 'Karthik Rajan', email: 'karthik@example.com', username: 'karthik_lens', city: 'Chennai', country: 'India', travelStyle: TravelStyle.WEEKEND_EXPLORER, bio: 'Travel photographer | Captured in 40+ cities' },
  { name: 'Meera Iyer', email: 'meera@example.com', username: 'meera_wanders', city: 'Jaipur', country: 'India', travelStyle: TravelStyle.BACKPACKER, bio: 'Budget queen. Seen the world on ₹1000/day.' },
  { name: 'Arjun Reddy', email: 'arjun@example.com', username: 'arjun_trails', city: 'Ahmedabad', country: 'India', travelStyle: TravelStyle.SOLO, bio: 'Ultra marathoner meets avid traveler' },
  { name: 'Kavya Menon', email: 'kavya@example.com', username: 'kavya_explores', city: 'Thiruvananthapuram', country: 'India', travelStyle: TravelStyle.SOLO, bio: 'Books + beaches + backpack = happiness' },
  { name: 'Rohan Gupta', email: 'rohan@example.com', username: 'rohan_roams', city: 'Kolkata', country: 'India', travelStyle: TravelStyle.ROAD_TRIPPER, bio: 'Northeast India specialist. Ask me anything.' },
  { name: 'Divya Krishnan', email: 'divya@example.com', username: 'divya_discovers', city: 'Coimbatore', country: 'India', travelStyle: TravelStyle.WEEKEND_EXPLORER, bio: 'Weekend wanderer from Tamil Nadu' },
  { name: 'Siddharth Joshi', email: 'sid@example.com', username: 'sid_travels', city: 'Nagpur', country: 'India', travelStyle: TravelStyle.DIGITAL_NOMAD, bio: 'Freelance dev | Work from beaches since 2021' },
  { name: 'Tanvi Desai', email: 'tanvi@example.com', username: 'tanvi_wanderlust', city: 'Surat', country: 'India', travelStyle: TravelStyle.LUXURY, bio: 'Turning travel into stories since 2015' },
  { name: 'Aarav Malhotra', email: 'aarav@example.com', username: 'aarav_adventures', city: 'Chandigarh', country: 'India', travelStyle: TravelStyle.BACKPACKER, bio: 'Himachal is my second home 🏔️' },
  { name: 'Pooja Choudhary', email: 'pooja@example.com', username: 'pooja_pathways', city: 'Udaipur', country: 'India', travelStyle: TravelStyle.SOLO, bio: 'Art, culture, and history chaser' },
  { name: 'Nikhil Verma', email: 'nikhil@example.com', username: 'nikhil_nomad', city: 'Indore', country: 'India', travelStyle: TravelStyle.ROAD_TRIPPER, bio: 'Motorcycles, mountains, madness' },
  { name: 'Shreya Banerjee', email: 'shreya@example.com', username: 'shreya_skies', city: 'Bhopal', country: 'India', travelStyle: TravelStyle.WEEKEND_EXPLORER, bio: 'Skydiver and scuba diver. Air and water = life.' },
  { name: 'Amit Kumar', email: 'amit@example.com', username: 'amit_explorer', city: 'Patna', country: 'India', travelStyle: TravelStyle.WEEKEND_EXPLORER, bio: 'Converting weekends into adventures since 2018' },
  { name: 'Ritu Agarwal', email: 'ritu@example.com', username: 'ritu_roamer', city: 'Lucknow', country: 'India', travelStyle: TravelStyle.LUXURY, bio: 'Luxury stays with local experiences' },
];

const TRIP_SEEDS = [
  {
    title: 'Spiti Valley Winter Expedition',
    description: 'Join me for an unforgettable journey through Spiti Valley in winter. We\'ll traverse frozen rivers, visit ancient monasteries, and experience life in one of the most remote places on Earth. Prior high-altitude experience recommended.',
    destination: 'Spiti Valley, Himachal Pradesh',
    startDate: new Date('2026-12-15'),
    endDate: new Date('2026-12-25'),
    budgetRange: BudgetRange.RANGE_10K_25K,
    maxMembers: 6,
    tripType: TripType.ADVENTURE,
    meetingPoint: 'Shimla ISBT Bus Stand',
    rules: 'Must be physically fit. No alcohol above 4000m. Bring warm layers.',
    creatorIndex: 0,
  },
  {
    title: 'Goa Beach Workation — January',
    description: 'Work remotely from the beaches of Goa! We\'ve got a co-working space lined up, evening beach plans, and weekend explorations. Perfect for digital nomads who want community while working.',
    destination: 'Goa',
    startDate: new Date('2027-01-05'),
    endDate: new Date('2027-01-19'),
    budgetRange: BudgetRange.RANGE_10K_25K,
    maxMembers: 8,
    tripType: TripType.WORKATION,
    meetingPoint: 'Calangute Beach Shack (WhatsApp group after approval)',
    rules: 'Remote workers only. Respect everyone\'s work hours (9am–1pm focus time).',
    creatorIndex: 3,
  },
  {
    title: 'Rajasthan Royal Heritage Road Trip',
    description: 'Cover the golden triangle and beyond — Delhi, Agra, Jaipur, Jodhpur, Udaipur, Jaisalmer. Heritage havelis, camel safaris, folk music nights under the stars.',
    destination: 'Rajasthan (Jaipur → Jaisalmer)',
    startDate: new Date('2027-02-01'),
    endDate: new Date('2027-02-12'),
    budgetRange: BudgetRange.RANGE_10K_25K,
    maxMembers: 5,
    tripType: TripType.ROAD_TRIP,
    meetingPoint: 'Jaipur Railway Station, Platform 1',
    rules: 'Shared car costs split equally. No strict agenda — we go with the flow.',
    creatorIndex: 2,
  },
  {
    title: 'Andaman Islands Diving & Snorkeling',
    description: 'Explore some of India\'s best diving spots — Havelock Island, Neil Island, and Barren Island volcano. All skill levels welcome; certified instructors available on-site.',
    destination: 'Andaman & Nicobar Islands',
    startDate: new Date('2027-01-20'),
    endDate: new Date('2027-01-30'),
    budgetRange: BudgetRange.ABOVE_25K,
    maxMembers: 8,
    tripType: TripType.ADVENTURE,
    meetingPoint: 'Port Blair Airport Arrivals',
    rules: 'Swimming ability required. Respect marine life — no touching corals.',
    creatorIndex: 1,
  },
  {
    title: 'Kerala Backwaters Houseboat Trip',
    description: 'Glide through the serene backwaters of Kerala on a traditional kettuvallam. Eat fresh seafood, watch the countryside drift by, and just... breathe.',
    destination: 'Alleppey (Alappuzha), Kerala',
    startDate: new Date('2027-03-01'),
    endDate: new Date('2027-03-05'),
    budgetRange: BudgetRange.RANGE_5K_10K,
    maxMembers: 6,
    tripType: TripType.LEISURE,
    meetingPoint: 'Alleppey Boat Jetty',
    rules: 'No loud music after 10pm. Eco-friendly — no plastic.',
    creatorIndex: 9,
  },
  {
    title: 'Northeast India: Meghalaya & Cherrapunji',
    description: 'Trek through living root bridges, swim in crystal-clear streams, stay in riverside camps, and witness the wettest place on Earth in its off-season beauty.',
    destination: 'Shillong & Cherrapunji, Meghalaya',
    startDate: new Date('2027-02-15'),
    endDate: new Date('2027-02-22'),
    budgetRange: BudgetRange.RANGE_5K_10K,
    maxMembers: 7,
    tripType: TripType.BACKPACKING,
    meetingPoint: 'Guwahati Railway Station',
    rules: 'Pack light — max 15kg backpack. Eco-conscious group.',
    creatorIndex: 10,
  },
  {
    title: 'Coorg Coffee Estate Photography Walk',
    description: 'Morning mist over coffee estates, waterfalls, spice gardens, and misty hills. This trip is built for photographers — golden hours, landscape shots, and cultural encounters.',
    destination: 'Coorg (Kodagu), Karnataka',
    startDate: new Date('2027-01-10'),
    endDate: new Date('2027-01-15'),
    budgetRange: BudgetRange.RANGE_5K_10K,
    maxMembers: 5,
    tripType: TripType.PHOTOGRAPHY,
    meetingPoint: 'Mysuru Railway Station',
    rules: 'Please bring a proper camera. DSLR/mirrorless preferred.',
    creatorIndex: 6,
  },
  {
    title: 'Mumbai to Ladakh: Bike Expedition',
    description: 'The legendary Mumbai-Leh route on motorcycles! Epic passes, desolate landscapes, lakes, monasteries — 4000+ km of pure freedom. Own bike or rental arrangements possible.',
    destination: 'Mumbai → Leh (via Manali)',
    startDate: new Date('2027-06-01'),
    endDate: new Date('2027-06-20'),
    budgetRange: BudgetRange.ABOVE_25K,
    maxMembers: 8,
    tripType: TripType.ROAD_TRIP,
    meetingPoint: 'Mumbai, Haji Ali (exact spot via WhatsApp)',
    rules: 'Must have bike riding experience. Riding license mandatory. Min 2 years experience.',
    creatorIndex: 16,
  },
  {
    title: 'Pondicherry Long Weekend Escape',
    description: 'French quarter walks, beach cafes, yoga at sunrise, Auroville visit, authentic French-Tamil cuisine. A perfect long-weekend detox from the city.',
    destination: 'Pondicherry',
    startDate: new Date('2027-01-25'),
    endDate: new Date('2027-01-28'),
    budgetRange: BudgetRange.UNDER_5K,
    maxMembers: 6,
    tripType: TripType.LEISURE,
    meetingPoint: 'Pondicherry Bus Stand',
    rules: 'Chill vibes only. No fixed plans — go with the group.',
    creatorIndex: 11,
  },
  {
    title: 'Valley of Flowers Trek',
    description: 'UNESCO World Heritage Trek. When the Himalayas bloom with hundreds of alpine flowers — one of the most visually stunning treks in the world. Moderate difficulty.',
    destination: 'Valley of Flowers, Uttarakhand',
    startDate: new Date('2027-08-01'),
    endDate: new Date('2027-08-09'),
    budgetRange: BudgetRange.RANGE_5K_10K,
    maxMembers: 10,
    tripType: TripType.ADVENTURE,
    meetingPoint: 'Haridwar Railway Station',
    rules: 'Moderate fitness required. Forest department permits included in trip cost.',
    creatorIndex: 8,
  },
  {
    title: 'Hampi Ruins Backpacking Weekend',
    description: 'Explore the surreal boulder-strewn landscape of Hampi — Vijayanagara Empire ruins, temples, river-crossing, hippie island, and breathtaking sunrise at Matanga Hill.',
    destination: 'Hampi, Karnataka',
    startDate: new Date('2027-01-17'),
    endDate: new Date('2027-01-20'),
    budgetRange: BudgetRange.UNDER_5K,
    maxMembers: 8,
    tripType: TripType.BACKPACKING,
    meetingPoint: 'Hospet Railway Station',
    rules: 'Ultra-budget trip. Guesthouses max ₹500/night. Cycle rentals for exploration.',
    creatorIndex: 7,
  },
  {
    title: 'Kasol & Kheerganga: Hippie Hills',
    description: 'Parvati Valley\'s most iconic combo. Village hopping in Kasol, Israeli food, the hot springs of Kheerganga, and Chalal\'s riverside cafes.',
    destination: 'Kasol & Kheerganga, Himachal Pradesh',
    startDate: new Date('2027-03-15'),
    endDate: new Date('2027-03-21'),
    budgetRange: BudgetRange.UNDER_5K,
    maxMembers: 8,
    tripType: TripType.BACKPACKING,
    meetingPoint: 'Bhuntar Bus Stand (nearest to Kasol)',
    rules: 'Open minded group. Respect local culture. No littering on trails.',
    creatorIndex: 14,
  },
  {
    title: 'Lakshadweep Islands Luxury Escape',
    description: 'Pristine lagoons, zero crowds, world-class snorkeling, and some of the clearest water in the world. Coordinating travel permits (we handle it). Premium stay at Bangaram Island.',
    destination: 'Bangaram Island, Lakshadweep',
    startDate: new Date('2027-04-01'),
    endDate: new Date('2027-04-08'),
    budgetRange: BudgetRange.ABOVE_25K,
    maxMembers: 6,
    tripType: TripType.LEISURE,
    meetingPoint: 'Cochin International Airport',
    rules: 'Very limited alcohol on the island. Respect island regulations.',
    creatorIndex: 5,
  },
  {
    title: 'Rann of Kutch: Tent City & White Desert',
    description: 'Experience the otherworldly white salt desert under the full moon. The Rann Utsav tent city, traditional music, folk performances, and sunrise jeep safaris.',
    destination: 'Dhordo, Kutch, Gujarat',
    startDate: new Date('2027-02-25'),
    endDate: new Date('2027-03-01'),
    budgetRange: BudgetRange.RANGE_5K_10K,
    maxMembers: 10,
    tripType: TripType.LEISURE,
    meetingPoint: 'Bhuj Railway Station',
    rules: 'Tent city pre-booked. No modifications to accommodation choice.',
    creatorIndex: 18,
  },
  {
    title: 'Banaras Spiritual & Food Walk',
    description: 'Ancient ghats, morning aarti, boat rides on the Ganges, the best street food in India (chaat, kachori, thandai), and ancient temples. A sensory overload in the best way.',
    destination: 'Varanasi, Uttar Pradesh',
    startDate: new Date('2027-02-08'),
    endDate: new Date('2027-02-12'),
    budgetRange: BudgetRange.UNDER_5K,
    maxMembers: 8,
    tripType: TripType.LEISURE,
    meetingPoint: 'Varanasi Junction (Kashi) Railway Station',
    rules: 'Respect the religious significance. Modest clothing for temples.',
    creatorIndex: 19,
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up
  await prisma.message.deleteMany();
  await prisma.joinRequest.deleteMany();
  await prisma.tripMember.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all(
    USERS.map((u) =>
      prisma.user.create({
        data: {
          id: undefined,
          email: u.email,
          name: u.name,
          username: u.username,
          city: u.city,
          country: u.country,
          travelStyle: u.travelStyle,
          bio: u.bio,
        },
      }),
    ),
  );
  console.log(`✅ Created ${users.length} users`);

  // Fetch cover images for each trip destination (parallel, best-effort)
  console.log('🖼️  Fetching destination images...');
  const coverImages = await Promise.all(
    TRIP_SEEDS.map((t) => fetchDestinationImage(t.destination)),
  );
  const imagesFetched = coverImages.filter(Boolean).length;
  if (imagesFetched > 0) console.log(`   Got ${imagesFetched}/${TRIP_SEEDS.length} images from Unsplash`);
  else console.log('   No UNSPLASH_ACCESS_KEY set — skipping images');

  // Create trips + creator membership
  const trips = await Promise.all(
    TRIP_SEEDS.map((t, i) => {
      const creator = users[t.creatorIndex];
      return prisma.trip.create({
        data: {
          creatorId: creator.id,
          title: t.title,
          description: t.description,
          destination: t.destination,
          startDate: t.startDate,
          endDate: t.endDate,
          budgetRange: t.budgetRange,
          maxMembers: t.maxMembers,
          tripType: t.tripType,
          meetingPoint: t.meetingPoint,
          rules: t.rules,
          coverImage: coverImages[i] ?? null,
          members: {
            create: { userId: creator.id, role: MemberRole.CREATOR },
          },
        },
      });
    }),
  );
  console.log(`✅ Created ${trips.length} trips`);

  // Add some members to trips (approved)
  const membershipPairs: Array<{ tripIndex: number; userIndex: number }> = [
    { tripIndex: 0, userIndex: 4 }, { tripIndex: 0, userIndex: 8 },
    { tripIndex: 1, userIndex: 9 }, { tripIndex: 1, userIndex: 12 }, { tripIndex: 1, userIndex: 13 },
    { tripIndex: 2, userIndex: 6 }, { tripIndex: 2, userIndex: 15 },
    { tripIndex: 3, userIndex: 1 }, { tripIndex: 3, userIndex: 17 },
    { tripIndex: 4, userIndex: 11 }, { tripIndex: 4, userIndex: 19 },
    { tripIndex: 5, userIndex: 10 }, { tripIndex: 5, userIndex: 7 },
    { tripIndex: 6, userIndex: 2 },
    { tripIndex: 10, userIndex: 3 }, { tripIndex: 10, userIndex: 5 },
  ];

  // Create join requests (approved) + trip members
  for (const { tripIndex, userIndex } of membershipPairs) {
    const trip = trips[tripIndex];
    const user = users[userIndex];
    const creatorId = trip.creatorId;
    if (user.id === creatorId) continue;

    await prisma.joinRequest.create({
      data: { tripId: trip.id, userId: user.id, status: JoinRequestStatus.APPROVED },
    });
    await prisma.tripMember.create({
      data: { tripId: trip.id, userId: user.id, role: MemberRole.MEMBER },
    });
  }
  console.log(`✅ Created ${membershipPairs.length} memberships`);

  // Create pending join requests
  const pendingPairs: Array<{ tripIndex: number; userIndex: number }> = [
    { tripIndex: 0, userIndex: 14 }, { tripIndex: 0, userIndex: 16 },
    { tripIndex: 1, userIndex: 18 },
    { tripIndex: 3, userIndex: 7 }, { tripIndex: 3, userIndex: 15 },
    { tripIndex: 7, userIndex: 4 }, { tripIndex: 7, userIndex: 9 },
    { tripIndex: 9, userIndex: 2 },
  ];

  for (const { tripIndex, userIndex } of pendingPairs) {
    const trip = trips[tripIndex];
    const user = users[userIndex];
    if (user.id === trip.creatorId) continue;

    const existingRequest = await prisma.joinRequest.findUnique({
      where: { tripId_userId: { tripId: trip.id, userId: user.id } },
    });
    if (!existingRequest) {
      await prisma.joinRequest.create({
        data: { tripId: trip.id, userId: user.id, status: JoinRequestStatus.PENDING },
      });
    }
  }
  console.log(`✅ Created pending join requests`);

  // Seed chat messages for trips with members
  const chatMessages = [
    { tripIndex: 0, messages: [
      { userIndex: 0, content: 'Hey everyone! So excited for Spiti 🏔️' },
      { userIndex: 4, content: 'Same here! Have you packed your thermal layers yet?' },
      { userIndex: 8, content: 'Just got back from a gear check. All set! Should we coordinate meeting time?' },
      { userIndex: 0, content: 'Let\'s all reach Shimla ISBT by 6am. We\'ll catch the early bus to Reckong Peo' },
      { userIndex: 4, content: 'Perfect. I\'m booking my train to Shimla now.' },
    ]},
    { tripIndex: 1, messages: [
      { userIndex: 3, content: 'Welcome to the Goa Workation crew! 🌴 So glad you all joined.' },
      { userIndex: 9, content: 'Thank you! Already found a great little café near Baga for morning work sessions' },
      { userIndex: 12, content: 'Sharing the co-working space address: Dunes Cowork, Anjuna. They have great WiFi' },
      { userIndex: 13, content: 'Perfect! Shall we do a welcome dinner the first evening? I know a great seafood place' },
      { userIndex: 3, content: 'Love that idea. Let\'s vote 🗳️' },
    ]},
    { tripIndex: 5, messages: [
      { userIndex: 10, content: 'Meghalaya crew! Who\'s reached Guwahati already?' },
      { userIndex: 7, content: 'Just landed! Grabbing a coffee at the airport. See you at the station.' },
      { userIndex: 10, content: 'Perfect. We have the 3pm shared cab to Shillong. 4-hour drive.' },
    ]},
  ];

  for (const { tripIndex, messages } of chatMessages) {
    const trip = trips[tripIndex];
    for (const msg of messages) {
      const user = users[msg.userIndex];
      await prisma.message.create({
        data: {
          tripId: trip.id,
          senderId: user.id,
          content: msg.content,
          createdAt: new Date(Date.now() - Math.random() * 86400000),
        },
      });
    }
  }
  console.log(`✅ Seeded chat messages`);

  // ── Itinerary seed ──────────────────────────────────────────────────────────
  console.log('📅 Seeding itineraries...');

  const ITINERARIES: Array<{
    tripIndex: number;
    days: Array<{
      title: string;
      date: string;
      items: Array<{ time?: string; title: string; description?: string; location?: string; type: string }>;
    }>;
  }> = [
    // Trip 0: Spiti Valley Winter Expedition
    {
      tripIndex: 0,
      days: [
        {
          title: 'Arrival in Shimla',
          date: '2026-12-15',
          items: [
            { time: '08:00', title: 'Group assembly at Shimla ISBT', description: 'Meet your co-travelers. Gear check and briefing.', location: 'Shimla ISBT', type: 'ACTIVITY' },
            { time: '10:00', title: 'Drive to Narkanda', description: 'Scenic drive through apple orchards and pine forests.', location: 'Narkanda', type: 'TRANSPORT' },
            { time: '13:00', title: 'Lunch at Hatu Peak Dhaba', description: 'Simple Himachali dal-rice with a view.', location: 'Narkanda', type: 'FOOD' },
            { time: '18:00', title: 'Check-in at Rampur guesthouse', description: 'Budget guesthouse, warm beds. Rest well.', location: 'Rampur', type: 'ACCOMMODATION' },
          ],
        },
        {
          title: 'Into the Spiti Valley',
          date: '2026-12-16',
          items: [
            { time: '07:00', title: 'Early morning departure', description: 'Roads can freeze — start early.', type: 'TRANSPORT' },
            { time: '11:00', title: 'Nako Lake viewpoint', description: 'Frozen high-altitude lake at 3,600m. Stunning.', location: 'Nako', type: 'SIGHTSEEING' },
            { time: '13:30', title: 'Hot thukpa at Nako village', description: 'Tibetan noodle soup to warm up.', location: 'Nako Village', type: 'FOOD' },
            { time: '17:00', title: 'Reach Kaza', description: 'The main town in Spiti Valley. Settle in.', location: 'Kaza', type: 'ACCOMMODATION' },
          ],
        },
        {
          title: 'Kaza Exploration',
          date: '2026-12-17',
          items: [
            { time: '09:00', title: 'Key Monastery visit', description: '1000-year-old monastery perched on a hilltop. Monks, murals, and silence.', location: 'Key Gompa', type: 'SIGHTSEEING' },
            { time: '12:00', title: 'Kibber village walk', description: "One of the world's highest motorable villages at 4,200m.", location: 'Kibber', type: 'ACTIVITY' },
            { time: '14:00', title: 'Village home lunch', description: 'Hosted by a local family. Try tsampa and butter tea.', type: 'FOOD' },
            { time: '19:00', title: 'Bonfire and stargazing', description: 'Spiti has some of the darkest skies in Asia. Milky Way guaranteed.', type: 'ACTIVITY' },
          ],
        },
        {
          title: 'Frozen River Trek',
          date: '2026-12-18',
          items: [
            { time: '08:00', title: 'Chadar-style frozen Pin River walk', description: 'Walk on the frozen Pin River. Crampons provided.', location: 'Pin River', type: 'ACTIVITY' },
            { time: '13:00', title: 'Packed lunch on ice', description: 'Parathas and pickles on the frozen river. Unforgettable.', type: 'FOOD' },
            { time: '16:00', title: 'Dhankar Monastery + Lake', description: 'Precarious monastery above a gorge. Hidden lake nearby.', location: 'Dhankar', type: 'SIGHTSEEING' },
          ],
        },
        {
          title: 'Return Journey',
          date: '2026-12-19',
          items: [
            { time: '06:30', title: 'Sunrise over Spiti Valley', description: 'Set your alarm — this one is worth it.', type: 'SIGHTSEEING' },
            { time: '08:00', title: 'Drive back to Shimla', description: 'Long day on mountain roads. Stock up on snacks.', type: 'TRANSPORT' },
            { time: '20:00', title: 'Farewell dinner in Shimla', description: 'Himachali thali and chai at a Mall Road restaurant.', location: 'The Mall, Shimla', type: 'FOOD' },
          ],
        },
      ],
    },

    // Trip 1: Goa Beach Workation
    {
      tripIndex: 1,
      days: [
        {
          title: 'Arrival & Setup',
          date: '2027-01-05',
          items: [
            { time: '14:00', title: 'Check-in at Calangute guesthouse', description: 'Drop your bags, freshen up.', location: 'Calangute', type: 'ACCOMMODATION' },
            { time: '16:00', title: 'Dunes Cowork orientation', description: 'WiFi setup, desk allocation, introductions.', location: 'Dunes Cowork, Anjuna', type: 'ACTIVITY' },
            { time: '19:00', title: 'Welcome dinner at beach shack', description: 'Grilled kingfish, cold Kingfisher, meet the crew.', location: 'Baga Beach', type: 'FOOD' },
          ],
        },
        {
          title: 'First Work Day',
          date: '2027-01-06',
          items: [
            { time: '09:00', title: 'Focus work block', description: 'Co-working space. No distractions till 1pm.', location: 'Dunes Cowork', type: 'ACTIVITY' },
            { time: '13:00', title: 'Lunch at Cafe Sussegado', description: 'Pork sorpotel and Goan bread. Worth the detour.', type: 'FOOD' },
            { time: '14:00', title: 'Afternoon work session', description: 'Calls, code, writing — whatever your thing is.', type: 'ACTIVITY' },
            { time: '17:30', title: 'Sunset at Vagator Beach', description: 'Golden hour. Leave the laptop behind.', location: 'Vagator Beach', type: 'SIGHTSEEING' },
          ],
        },
        {
          title: 'Weekend — Explore North Goa',
          date: '2027-01-08',
          items: [
            { time: '08:00', title: 'Morning yoga on the beach', description: 'Optional. Starts at 8am near Ashvem.', location: 'Ashvem Beach', type: 'ACTIVITY' },
            { time: '11:00', title: 'Chapora Fort', description: 'Made famous by Dil Chahta Hai. Great views of the Arabian Sea.', location: 'Chapora Fort', type: 'SIGHTSEEING' },
            { time: '14:00', title: 'Lunch at Thalassa', description: 'Greek food with an ocean view. Slightly fancy, worth it.', location: 'Vagator', type: 'FOOD' },
            { time: '17:00', title: 'Saturday Night Market', description: 'Arpora market. Handicrafts, live music, street food.', location: 'Arpora', type: 'ACTIVITY' },
          ],
        },
      ],
    },

    // Trip 2: Rajasthan Road Trip
    {
      tripIndex: 2,
      days: [
        {
          title: 'Jaipur — The Pink City',
          date: '2027-02-01',
          items: [
            { time: '09:00', title: 'Amber Fort', description: 'Hilltop Mughal fort with mirror palace and elephant rides.', location: 'Amber Fort, Jaipur', type: 'SIGHTSEEING' },
            { time: '13:00', title: 'Thali at LMB Restaurant', description: 'Legendary pure-veg Rajasthani thali since 1954.', location: 'LMB, Johari Bazar', type: 'FOOD' },
            { time: '15:00', title: 'City Palace & Jantar Mantar', description: 'Royal palace and an 18th-century astronomical observatory.', location: 'Old City, Jaipur', type: 'SIGHTSEEING' },
            { time: '18:30', title: 'Sunset at Nahargarh Fort', description: 'Best sunset view of Jaipur. Drinks at Padao restaurant.', location: 'Nahargarh Fort', type: 'SIGHTSEEING' },
          ],
        },
        {
          title: 'Jodhpur — The Blue City',
          date: '2027-02-04',
          items: [
            { time: '08:00', title: 'Drive Jaipur → Jodhpur', description: '5-hour drive through scrub desert. Good podcast time.', type: 'TRANSPORT' },
            { time: '14:00', title: 'Mehrangarh Fort', description: "One of India's largest forts. The cannon marks are real.", location: 'Mehrangarh Fort', type: 'SIGHTSEEING' },
            { time: '17:00', title: 'Blue city rooftop walk', description: 'Wander the indigo-painted lanes of the old city.', location: 'Old City, Jodhpur', type: 'ACTIVITY' },
            { time: '20:00', title: 'Dinner at Indique', description: 'Rooftop restaurant with fort views. Dal baati churma is a must.', type: 'FOOD' },
          ],
        },
        {
          title: 'Jaisalmer — The Golden City',
          date: '2027-02-07',
          items: [
            { time: '07:00', title: 'Drive to Jaisalmer', description: '5-hour drive through the Thar Desert.', type: 'TRANSPORT' },
            { time: '15:00', title: 'Jaisalmer Fort (Sonar Quila)', description: 'A living fort — people still reside inside.', location: 'Jaisalmer Fort', type: 'SIGHTSEEING' },
            { time: '18:00', title: 'Sam Sand Dunes sunset', description: 'Camel ride to the dunes for sunset. Traditional folk music after.', location: 'Sam Sand Dunes', type: 'ACTIVITY' },
            { time: '21:00', title: 'Dinner under the stars', description: 'Desert camp dinner. Rajasthani folk performance. Sleep in tents.', type: 'FOOD' },
          ],
        },
      ],
    },

    // Trip 3: Andaman Diving Trip
    {
      tripIndex: 3,
      days: [
        {
          title: 'Port Blair Arrival',
          date: '2027-01-20',
          items: [
            { time: '12:00', title: 'Land at Veer Savarkar Airport', description: 'Group meet & greet. Transfer to hotel.', location: 'Port Blair Airport', type: 'TRANSPORT' },
            { time: '15:00', title: 'Cellular Jail — Light & Sound show', description: 'The haunting history of this colonial prison. Go for the evening show.', location: 'Cellular Jail', type: 'SIGHTSEEING' },
            { time: '20:00', title: 'Aberdeen Bazaar seafood dinner', description: 'Lobster, crab, and fresh catch at the local market.', location: 'Aberdeen Bazaar', type: 'FOOD' },
          ],
        },
        {
          title: 'Havelock Island — Radhanagar Beach',
          date: '2027-01-22',
          items: [
            { time: '07:00', title: 'Ferry to Havelock Island', description: 'Government ferry. 2 hours. Arrive at Beach No. 5.', location: 'Phoenix Bay Jetty', type: 'TRANSPORT' },
            { time: '11:00', title: 'Radhanagar Beach', description: "Asia's best beach. White sand, turquoise water. Swim and sunbathe.", location: 'Beach No. 7, Havelock', type: 'ACTIVITY' },
            { time: '16:00', title: 'Intro dive session', description: 'First dive for beginners. Certified instructor led.', location: 'Nemo Reef', type: 'ACTIVITY' },
            { time: '20:00', title: 'Barefoot Bar dinner', description: 'Beachside restaurant. Fish curry and coconut water.', type: 'FOOD' },
          ],
        },
        {
          title: 'Scuba Diving Day',
          date: '2027-01-24',
          items: [
            { time: '07:30', title: 'Morning dive — Elephant Beach', description: '15m visibility. Coral gardens, parrotfish, moray eels.', location: 'Elephant Beach', type: 'ACTIVITY' },
            { time: '11:30', title: 'Snorkeling break', description: 'Surface snorkeling while certified divers go deeper.', type: 'ACTIVITY' },
            { time: '14:00', title: 'Afternoon dive — Aquarium site', description: 'Named for its glass-clear visibility. Best macro dive site.', type: 'ACTIVITY' },
            { time: '19:00', title: 'Dive log review + debrief', description: "Review photos, share footage, plan tomorrow's dives.", type: 'ACTIVITY' },
          ],
        },
      ],
    },

    // Trip 4: Kerala Backwaters
    {
      tripIndex: 4,
      days: [
        {
          title: 'Alleppey Arrival & Embarkation',
          date: '2027-03-01',
          items: [
            { time: '10:00', title: 'Meet at Alleppey Boat Jetty', description: 'Group intro, luggage on boat, safety briefing.', location: 'Alleppey Boat Jetty', type: 'ACTIVITY' },
            { time: '12:00', title: 'Set sail on the kettuvallam', description: 'Traditional rice boat with bedrooms, kitchen, and sundeck.', type: 'TRANSPORT' },
            { time: '13:30', title: 'Lunch on the boat', description: 'Chef prepares Kerala sadya — rice, fish curry, avial on banana leaf.', type: 'FOOD' },
            { time: '16:00', title: 'Drift through Vembanad Lake', description: 'Widest lake in Kerala. Watch local fishermen at work.', location: 'Vembanad Lake', type: 'SIGHTSEEING' },
            { time: '19:30', title: 'Sunset from the sundeck', description: 'Arabian Sea-facing sunset over the backwaters. Pure magic.', type: 'SIGHTSEEING' },
          ],
        },
        {
          title: 'Village Life & Canoe',
          date: '2027-03-02',
          items: [
            { time: '06:30', title: 'Early morning bird watching', description: 'Kingfishers, egrets, cormorants. Bring binoculars.', type: 'ACTIVITY' },
            { time: '09:00', title: 'Canoe through narrow canals', description: 'Dugout canoe through palm-fringed village waterways. No motorboats.', type: 'ACTIVITY' },
            { time: '12:00', title: 'Village lunch at local home', description: 'Home-cooked Kerala meal. Meet the family.', type: 'FOOD' },
            { time: '15:00', title: 'Coconut processing demonstration', description: 'See how coir (coconut fiber) mats are made by hand.', type: 'ACTIVITY' },
            { time: '20:00', title: 'Kathakali performance (optional)', description: 'Traditional Kerala dance form. Book in advance.', type: 'ACTIVITY' },
          ],
        },
        {
          title: 'Kumarakom Bird Sanctuary & Return',
          date: '2027-03-04',
          items: [
            { time: '07:00', title: 'Kumarakom Bird Sanctuary walk', description: 'Migratory birds from Siberia in winter. Best at dawn.', location: 'Kumarakom', type: 'SIGHTSEEING' },
            { time: '10:00', title: 'Toddy shop stop', description: "Kerala's traditional palm wine. Pair with fish fry.", type: 'FOOD' },
            { time: '13:00', title: 'Return to Alleppey Jetty', description: 'Disembark. Exchange contacts. Hug it out.', location: 'Alleppey', type: 'TRANSPORT' },
          ],
        },
      ],
    },
  ];

  let itineraryDaysCreated = 0;
  let itineraryItemsCreated = 0;

  for (const { tripIndex, days } of ITINERARIES) {
    const trip = trips[tripIndex];
    for (let di = 0; di < days.length; di++) {
      const dayData = days[di];
      const day = await prisma.itineraryDay.create({
        data: {
          tripId: trip.id,
          dayNumber: di + 1,
          title: dayData.title,
          date: new Date(dayData.date),
        },
      });
      itineraryDaysCreated++;

      for (let ii = 0; ii < dayData.items.length; ii++) {
        const item = dayData.items[ii];
        await prisma.itineraryItem.create({
          data: {
            dayId: day.id,
            tripId: trip.id,
            order: ii,
            time: item.time ?? null,
            title: item.title,
            description: item.description ?? null,
            location: item.location ?? null,
            type: item.type as any,
            status: 'APPROVED',
          },
        });
        itineraryItemsCreated++;
      }
    }
  }
  console.log(`✅ Seeded ${itineraryDaysCreated} itinerary days, ${itineraryItemsCreated} items`);

  // ── Essential items seed ────────────────────────────────────────────────────
  console.log('🎒 Seeding essential items...');

  const ESSENTIALS: Array<{ tripIndex: number; items: Array<{ text: string; category: string }> }> = [
    // Trip 0: Spiti Valley Winter Expedition
    {
      tripIndex: 0,
      items: [
        { text: 'Thermal base layer (top & bottom)', category: 'Clothing' },
        { text: 'Down jacket (rated -20°C or below)', category: 'Clothing' },
        { text: 'Waterproof outer shell jacket', category: 'Clothing' },
        { text: 'Fleece mid-layer', category: 'Clothing' },
        { text: 'Woollen socks (4+ pairs)', category: 'Clothing' },
        { text: 'Insulated waterproof boots', category: 'Clothing' },
        { text: 'Balaclava and warm hat', category: 'Clothing' },
        { text: 'Crampons or micro-spikes', category: 'Gear & Equipment' },
        { text: 'Trekking poles', category: 'Gear & Equipment' },
        { text: 'Headlamp with extra batteries', category: 'Gear & Equipment' },
        { text: 'Sleeping bag rated -15°C', category: 'Gear & Equipment' },
        { text: 'Sunglasses (UV400 minimum)', category: 'Gear & Equipment' },
        { text: 'Government ID proof (original)', category: 'Documents' },
        { text: 'Inner Line Permit (if required)', category: 'Documents' },
        { text: 'Travel insurance document', category: 'Documents' },
        { text: 'Altitude sickness medication (Diamox)', category: 'Health & Safety' },
        { text: 'Sunscreen SPF 50+', category: 'Health & Safety' },
        { text: 'Lip balm', category: 'Health & Safety' },
        { text: 'Basic first aid kit', category: 'Health & Safety' },
        { text: 'Rehydration salts', category: 'Health & Safety' },
        { text: 'Power bank (10,000 mAh+)', category: 'Electronics' },
        { text: 'Universal travel adapter', category: 'Electronics' },
        { text: 'Offline maps downloaded (Google Maps / Maps.me)', category: 'Electronics' },
        { text: 'Energy bars and dry snacks', category: 'Food & Water' },
        { text: 'Insulated water bottle (1L+)', category: 'Food & Water' },
        { text: 'Water purification tablets', category: 'Food & Water' },
      ],
    },

    // Trip 1: Goa Beach Workation
    {
      tripIndex: 1,
      items: [
        { text: 'Light breathable clothing (5–7 outfits)', category: 'Clothing' },
        { text: 'Swimwear (2 sets)', category: 'Clothing' },
        { text: 'Rain jacket / poncho', category: 'Clothing' },
        { text: 'Comfortable walking sandals', category: 'Clothing' },
        { text: 'Laptop and charger', category: 'Electronics' },
        { text: 'Noise-cancelling headphones', category: 'Electronics' },
        { text: 'Portable WiFi / SIM card', category: 'Electronics' },
        { text: 'Power bank', category: 'Electronics' },
        { text: 'Multi-port USB charger', category: 'Electronics' },
        { text: 'Passport / Aadhaar (for hotel check-in)', category: 'Documents' },
        { text: 'Sunscreen SPF 50+', category: 'Health & Safety' },
        { text: 'Insect repellent', category: 'Health & Safety' },
        { text: 'Antacids / stomach medication', category: 'Health & Safety' },
        { text: 'After-sun lotion', category: 'Health & Safety' },
        { text: 'Reusable water bottle', category: 'Food & Water' },
      ],
    },

    // Trip 2: Rajasthan Road Trip
    {
      tripIndex: 2,
      items: [
        { text: 'Lightweight cotton kurtas / loose clothing', category: 'Clothing' },
        { text: 'Comfortable closed-toe walking shoes', category: 'Clothing' },
        { text: 'Dupatta / stole for temple visits', category: 'Clothing' },
        { text: 'Sunhat or cap', category: 'Clothing' },
        { text: 'Sunscreen SPF 50+', category: 'Health & Safety' },
        { text: 'ORS packets (it gets very hot)', category: 'Health & Safety' },
        { text: 'Stomach medication (Enterogermina or similar)', category: 'Health & Safety' },
        { text: 'Motion sickness tablets (long road stretches)', category: 'Health & Safety' },
        { text: 'Government ID (original)', category: 'Documents' },
        { text: 'Cash in smaller denominations (many places don\'t take UPI)', category: 'Documents' },
        { text: 'Camera / extra memory cards', category: 'Electronics' },
        { text: 'Car charger / adapter', category: 'Electronics' },
        { text: 'Offline Rajasthan map downloaded', category: 'Electronics' },
        { text: 'Insulated water bottle', category: 'Food & Water' },
        { text: 'Dry snacks for long drives', category: 'Food & Water' },
        { text: 'Day backpack for sightseeing', category: 'Gear & Equipment' },
        { text: 'Locks for luggage', category: 'Gear & Equipment' },
      ],
    },

    // Trip 3: Andaman Diving
    {
      tripIndex: 3,
      items: [
        { text: 'Light beach clothes (3–5 outfits)', category: 'Clothing' },
        { text: 'Rash guard / UV protection swimwear', category: 'Clothing' },
        { text: 'Reef-safe sandals', category: 'Clothing' },
        { text: 'Quick-dry towel', category: 'Gear & Equipment' },
        { text: 'Underwater camera / GoPro', category: 'Electronics' },
        { text: 'Waterproof phone pouch', category: 'Electronics' },
        { text: 'Power bank', category: 'Electronics' },
        { text: 'PADI / SSI dive certification card (if certified)', category: 'Documents' },
        { text: 'Passport (required for Andaman ferry bookings)', category: 'Documents' },
        { text: 'Entry permit (automatically issued at airport)', category: 'Documents' },
        { text: 'Seasickness tablets', category: 'Health & Safety' },
        { text: 'Reef-safe sunscreen only (chemical sunscreen banned)', category: 'Health & Safety' },
        { text: 'Ear drops (for swimmer\'s ear prevention)', category: 'Health & Safety' },
        { text: 'Basic first aid kit', category: 'Health & Safety' },
        { text: 'Reusable water bottle', category: 'Food & Water' },
        { text: 'Energy bars for boat days', category: 'Food & Water' },
      ],
    },

    // Trip 4: Kerala Backwaters
    {
      tripIndex: 4,
      items: [
        { text: 'Light cotton clothing (Kerala is humid)', category: 'Clothing' },
        { text: 'Modest clothing for temple visits', category: 'Clothing' },
        { text: 'Comfortable slip-on footwear', category: 'Clothing' },
        { text: 'Rain jacket (monsoon proximity)', category: 'Clothing' },
        { text: 'Mosquito repellent (essential on backwaters)', category: 'Health & Safety' },
        { text: 'Sunscreen SPF 30+', category: 'Health & Safety' },
        { text: 'Antihistamine tablets', category: 'Health & Safety' },
        { text: 'Government ID (original)', category: 'Documents' },
        { text: 'Binoculars (for bird watching)', category: 'Gear & Equipment' },
        { text: 'Waterproof bag for valuables on the boat', category: 'Gear & Equipment' },
        { text: 'Camera with zoom lens', category: 'Electronics' },
        { text: 'Power bank (limited charging points on houseboat)', category: 'Electronics' },
        { text: 'Reusable water bottle', category: 'Food & Water' },
        { text: 'Snacks for early morning bird walks', category: 'Food & Water' },
      ],
    },
  ];

  let essentialsCreated = 0;
  for (const { tripIndex, items: essItems } of ESSENTIALS) {
    const trip = trips[tripIndex];
    for (let i = 0; i < essItems.length; i++) {
      await prisma.tripEssentialItem.create({
        data: { tripId: trip.id, text: essItems[i].text, category: essItems[i].category, order: i },
      });
      essentialsCreated++;
    }
  }
  console.log(`✅ Seeded ${essentialsCreated} essential items across ${ESSENTIALS.length} trips`);



  console.log('\n🎉 Seed complete!');
  console.log(`   Users:    ${users.length}`);
  console.log(`   Trips:    ${trips.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
