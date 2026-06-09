export function tripToSummary(trip: any) {
  return {
    id: trip.id, creatorId: trip.creatorId,
    creator: { id: trip.creator.id, name: trip.creator.name, username: trip.creator.username, image: trip.creator.image },
    title: trip.title, destination: trip.destination,
    startDate: trip.startDate.toISOString(), endDate: trip.endDate.toISOString(),
    budgetRange: trip.budgetRange, maxMembers: trip.maxMembers,
    currentMemberCount: trip._count?.members ?? 0,
    tripType: trip.tripType, coverImage: trip.coverImage,
    createdAt: trip.createdAt.toISOString(),
  };
}
