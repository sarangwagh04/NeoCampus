import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PersonalInfoSectionProps {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  email: string;
  mobileNumber: string;
  address: string;
  isEditMode: boolean;
  errors: Record<string, string>;
  onFieldChange: (field: string, value: string | Date) => void;
}

export function PersonalInfoSection({
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
  email,
  mobileNumber,
  address,
  isEditMode,
  errors,
  onFieldChange,
}: PersonalInfoSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-primary" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            {isEditMode ? (
              <>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => onFieldChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-foreground py-2">{firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name</Label>
            {isEditMode ? (
              <Input
                id="middleName"
                value={middleName}
                onChange={(e) => onFieldChange("middleName", e.target.value)}
              />
            ) : (
              <p className="text-sm text-foreground py-2">{middleName || "-"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            {isEditMode ? (
              <>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => onFieldChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-foreground py-2">{lastName}</p>
            )}
          </div>
        </div>

        {/* Gender & DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            {isEditMode ? (
              <Select
                value={gender}
                onValueChange={(value) => onFieldChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-foreground py-2">{gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            {isEditMode ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={(date) => date && onFieldChange("dateOfBirth", date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1990-01-01")
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <p className="text-sm text-foreground py-2">
                {format(dateOfBirth, "PPP")}
              </p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {isEditMode ? (
              <>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => onFieldChange("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-foreground py-2">{email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            {isEditMode ? (
              <>
                <Input
                  id="mobileNumber"
                  value={mobileNumber}
                  onChange={(e) => onFieldChange("mobileNumber", e.target.value)}
                  className={errors.mobileNumber ? "border-destructive" : ""}
                />
                {errors.mobileNumber && (
                  <p className="text-xs text-destructive">{errors.mobileNumber}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-foreground py-2">{mobileNumber}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          {isEditMode ? (
            <Textarea
              id="address"
              value={address}
              onChange={(e) => onFieldChange("address", e.target.value)}
              rows={3}
            />
          ) : (
            <p className="text-sm text-foreground py-2">{address}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
