import { useState } from "react";
import { Plus, MoreVertical, Mail, Phone } from "lucide-react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StaffRole } from "@/types";

const roleColors: Record<StaffRole, string> = {
  admin: "bg-destructive/10 text-destructive",
  dentist: "bg-primary/10 text-primary",
  hygienist: "bg-success/10 text-success",
  assistant: "bg-warning/10 text-warning",
  receptionist: "bg-info/10 text-info",
};

const Staff = () => {
  const { staff } = useStore();

  const groupedStaff = staff.reduce((acc, member) => {
    if (!acc[member.role]) {
      acc[member.role] = [];
    }
    acc[member.role].push(member);
    return acc;
  }, {} as Record<StaffRole, typeof staff>);

  const roleOrder: StaffRole[] = ["dentist", "hygienist", "assistant", "receptionist", "admin"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your practice team members
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff by Role */}
      <div className="space-y-6">
        {roleOrder.map((role) => {
          const members = groupedStaff[role];
          if (!members || members.length === 0) return null;

          return (
            <div key={role}>
              <h2 className="text-lg font-semibold capitalize mb-4 flex items-center gap-2">
                {role}s
                <Badge variant="secondary">{members.length}</Badge>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback
                              style={{ backgroundColor: member.color }}
                              className="text-white font-medium drop-shadow-sm"
                            >
                              {member.firstName.charAt(0)}
                              {member.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {member.firstName} {member.lastName}
                            </h3>
                            <Badge className={roleColors[member.role]} variant="secondary">
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>View Schedule</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Remove Staff
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        {member.specialization && (
                          <p className="text-muted-foreground">
                            {member.specialization}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {member.phone}
                        </div>
                        {member.licenseNumber && (
                          <p className="text-xs text-muted-foreground">
                            License: {member.licenseNumber}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Staff;
