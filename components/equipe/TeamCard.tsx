import { TeamMemberCard } from "@/components/team/team-member-card";
import type { TeamMemberConfig } from "@/lib/site-config";

interface TeamCardProps {
  member: TeamMemberConfig;
}

export function TeamCard({ member }: TeamCardProps) {
  return <TeamMemberCard member={member} variant="full" />;
}
