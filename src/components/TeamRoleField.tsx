import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TEAM_ROLES } from "@/lib/ftc";

export function TeamRoleField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();
  const preset = TEAM_ROLES.includes(value) ? value : "__custom";
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Team role</Label>
      <Select value={preset} onValueChange={(role) => onChange(role === "__custom" ? "" : role)}>
        <SelectTrigger aria-label="Choose team role"><SelectValue /></SelectTrigger>
        <SelectContent>
          {TEAM_ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
          <SelectItem value="__custom">Custom role</SelectItem>
        </SelectContent>
      </Select>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Enter your role" required />
    </div>
  );
}