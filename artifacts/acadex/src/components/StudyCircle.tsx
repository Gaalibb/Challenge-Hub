import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink, Radio, ChevronDown, ChevronUp } from "lucide-react";

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  members: number;
  active: boolean;
  description: string;
  whatsappLink: string;
}

export const ALL_STUDY_GROUPS: StudyGroup[] = [
  {
    id: "phy-1",
    name: "Physics: Mechanics & Beyond",
    subject: "Physics",
    members: 342,
    active: true,
    description: "Classical mechanics, thermodynamics, and wave motion. Perfect for Level 100–300.",
    whatsappLink: "https://chat.whatsapp.com/EduLink360Physics1",
  },
  {
    id: "phy-2",
    name: "Physics: Electromagnetism",
    subject: "Physics",
    members: 221,
    active: true,
    description: "Fields, circuits, Maxwell's equations, and optics. Level 300+.",
    whatsappLink: "https://chat.whatsapp.com/EduLink360Physics2",
  },
  {
    id: "math-1",
    name: "Mathematics: Calculus & Algebra",
    subject: "Mathematics",
    members: 289,
    active: true,
    description: "Differential calculus, integrals, linear algebra, and proofs.",
    whatsappLink: "https://chat.whatsapp.com/EduLink360Math1",
  },
  {
    id: "math-2",
    name: "Mathematics: Stats & Probability",
    subject: "Mathematics",
    members: 143,
    active: false,
    description: "Probability theory, distributions, hypothesis testing, and inference.",
    whatsappLink: "https://chat.whatsapp.com/EduLink360Math2",
  },
  {
    id: "cs-1",
    name: "Computer Science: Algorithms & DS",
    subject: "Computer Science",
    members: 456,
    active: true,
    description: "Data structures, sorting, graph algorithms, and complexity analysis.",
    whatsappLink: "https://chat.whatsapp.com/EduLink360CS1",
  },
  {
    id: "cs-2",
    name: "Computer Science: Systems & Networks",
    subject: "Computer Science",
    members: 178,
    active: true,
    description: "Operating systems, networking, distributed systems, and databases.",
    whatsappLink: "https://chat.whatsapp.com/EduLink360CS2",
  },
  {
    id: "bio-1",
    name: "Biology: Cell & Molecular",
    subject: "Biology",
    members: 198,
    active: true,
    description: "Cell biology, genetics, molecular mechanisms, and biochemistry.",
    whatsappLink: "https://chat.whatsapp.com/EduLink360Biology1",
  },
  {
    id: "chem-1",
    name: "Chemistry: Organic Reactions",
    subject: "Chemistry",
    members: 167,
    active: false,
    description: "Reaction mechanisms, functional groups, stereochemistry, and synthesis.",
    whatsappLink: "https://chat.whatsapp.com/EduLink360Chemistry1",
  },
];

interface StudyGroupCardProps {
  group: StudyGroup;
  compact?: boolean;
}

function StudyGroupCard({ group, compact }: StudyGroupCardProps) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border p-3 bg-background hover:border-[#25D366]/50 transition-colors ${compact ? "text-sm" : ""}`}
      data-testid={`study-group-${group.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-foreground leading-tight">{group.name}</span>
            {group.active ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#25D366] bg-[#25D366]/10 px-1.5 py-0.5 rounded-full shrink-0">
                <Radio className="h-2.5 w-2.5" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                Quiet
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {group.subject}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {group.members.toLocaleString()} members
            </span>
          </div>
        </div>
      </div>
      {!compact && (
        <p className="text-xs text-muted-foreground leading-relaxed">{group.description}</p>
      )}
      <a
        href={group.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe59] text-white text-xs font-semibold px-3 py-2 rounded-md transition-colors"
        data-testid={`join-button-${group.id}`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Join Group
        <ExternalLink className="h-3 w-3 opacity-70" />
      </a>
    </div>
  );
}

interface StudyCircleProps {
  subjectFilter?: string;
  showAll?: boolean;
}

export default function StudyCircle({ subjectFilter, showAll = false }: StudyCircleProps) {
  const [expanded, setExpanded] = useState(false);

  const filtered = subjectFilter
    ? ALL_STUDY_GROUPS.filter(
        (g) => g.subject.toLowerCase() === subjectFilter.toLowerCase()
      )
    : ALL_STUDY_GROUPS;

  const activeFirst = [...filtered].sort((a, b) => Number(b.active) - Number(a.active));
  const displayLimit = 3;
  const visible = showAll || expanded ? activeFirst : activeFirst.slice(0, displayLimit);
  const hasMore = !showAll && activeFirst.length > displayLimit;

  if (filtered.length === 0) {
    return (
      <Card className="border-[#25D366]/20">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="text-[#25D366] text-base">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 inline-block">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </span>
            StudyCircle
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-xs text-muted-foreground text-center py-3">
            No study groups found for <strong>{subjectFilter}</strong> yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#25D366]/20">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="#25D366" className="h-4 w-4 shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            StudyCircle
            {subjectFilter && (
              <Badge variant="secondary" className="text-[10px] px-1.5">
                {subjectFilter}
              </Badge>
            )}
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            {activeFirst.filter((g) => g.active).length} active
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {visible.map((group) => (
          <StudyGroupCard key={group.id} group={group} compact />
        ))}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground gap-1"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <><ChevronUp className="h-3 w-3" /> Show less</>
            ) : (
              <><ChevronDown className="h-3 w-3" /> Show {activeFirst.length - displayLimit} more groups</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
