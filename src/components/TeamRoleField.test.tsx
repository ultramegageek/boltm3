import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TeamRoleField } from "./TeamRoleField";

describe("custom team roles", () => {
  it("passes a keyboard-entered role to the profile or signup form", () => {
    const onChange = vi.fn();
    const { rerender } = render(<TeamRoleField value="Member" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "CAD Engineer" } });
    expect(onChange).toHaveBeenCalledWith("CAD Engineer");
    rerender(<TeamRoleField value="CAD Engineer" onChange={onChange} />);
    expect(screen.getByRole("textbox")).toHaveValue("CAD Engineer");
  });
});