import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const renderToggle = () =>
  render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ThemeToggle />
    </ThemeProvider>,
  );

describe("theme toggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("switches to dark mode and persists the preference", async () => {
    renderToggle();

    fireEvent.click(await screen.findByRole("button", { name: /switch to dark mode/i }));

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(await screen.findByRole("button", { name: /switch to light mode/i })).toBeInTheDocument();
  });
});
