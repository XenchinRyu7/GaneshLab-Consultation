import { Plus, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/lib/utils";

interface AppointmentPageHeaderProps {
  isClient: boolean;
  isPIC?: boolean;
  activeProjectName: string | null;
  pics?: Array<{ id: string; fullname: string; avatarColor?: string | null }>;
  selectedPicId?: string | null;
  currentUserId?: string;
  onPicChange?: (picId: string) => void;
  onCreateAppointment?: () => void;
}

export function AppointmentPageHeader({
  isClient,
  isPIC,
  activeProjectName,
  pics = [],
  selectedPicId,
  currentUserId,
  onPicChange,
  onCreateAppointment,
}: AppointmentPageHeaderProps) {
  const t = useTranslations("Appointments");
  const selectedPic = pics.find(p => p.id === selectedPicId);
  const isViewingOwnSchedule = selectedPicId === currentUserId;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {isClient
            ? activeProjectName
              ? t("clientDescriptionWithProject", { projectName: activeProjectName })
              : t("clientDescriptionNoProject")
            : isPIC && selectedPic
              ? isViewingOwnSchedule
                ? t("picDescriptionOwn")
                : t("picDescriptionViewingOther", { picName: selectedPic.fullname })
              : t("picDescriptionOwn")}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isPIC && pics.length > 0 && onPicChange && (
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-5 w-5" />
            <Select value={selectedPicId ?? ""} onValueChange={onPicChange}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t("selectPicPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {pics.map(pic => (
                  <SelectItem key={pic.id} value={pic.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback
                          className="text-xs text-white"
                          style={{ backgroundColor: pic.avatarColor ?? "#3b82f6" }}
                        >
                          {getInitials(pic.fullname)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{pic.fullname}</span>
                      {pic.id === currentUserId && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {t("youBadge")}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {isClient && onCreateAppointment && (
          <Button onClick={onCreateAppointment} className="gap-2">
            <Plus className="size-4" />
            <span>{t("createAppointment")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
