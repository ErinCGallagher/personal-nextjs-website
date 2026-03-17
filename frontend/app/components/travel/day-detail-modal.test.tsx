/** Tests for DayDetailModal component */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DayDetailModal from "./day-detail-modal";
import type { TravelEntry } from "./calendar-utils";

const travel: TravelEntry = {
  date: "2024-03-15",
  country: "France",
  city: "Paris",
  hotel: "Hotel du Louvre",
  flight: "AC123",
  rental_car: "Hertz compact",
  notes: "Visit the Eiffel Tower",
};

describe("DayDetailModal", () => {
  it("renders the country and city", () => {
    render(<DayDetailModal travel={travel} onClose={vi.fn()} />);
    expect(screen.getByText("France")).toBeTruthy();
    expect(screen.getByText("Paris")).toBeTruthy();
  });

  it("renders the hotel when present", () => {
    render(<DayDetailModal travel={travel} onClose={vi.fn()} />);
    expect(screen.getByText("Hotel du Louvre")).toBeTruthy();
  });

  it("does not render the hotel section when hotel is null", () => {
    render(<DayDetailModal travel={{ ...travel, hotel: null }} onClose={vi.fn()} />);
    expect(screen.queryByText("Hotel")).toBeNull();
  });

  it("renders the flight when present", () => {
    render(<DayDetailModal travel={travel} onClose={vi.fn()} />);
    expect(screen.getByText("AC123")).toBeTruthy();
  });

  it("does not render the flight section when flight is null", () => {
    render(<DayDetailModal travel={{ ...travel, flight: null }} onClose={vi.fn()} />);
    expect(screen.queryByText("Flight")).toBeNull();
  });

  it("renders the rental car when present", () => {
    render(<DayDetailModal travel={travel} onClose={vi.fn()} />);
    expect(screen.getByText("Hertz compact")).toBeTruthy();
  });

  it("renders notes when present", () => {
    render(<DayDetailModal travel={travel} onClose={vi.fn()} />);
    expect(screen.getByText("Visit the Eiffel Tower")).toBeTruthy();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<DayDetailModal travel={travel} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(<DayDetailModal travel={travel} onClose={onClose} />);
    // The backdrop is the outermost div
    fireEvent.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose when the modal content is clicked", () => {
    const onClose = vi.fn();
    render(<DayDetailModal travel={travel} onClose={onClose} />);
    fireEvent.click(screen.getByText("France"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the Escape key is pressed", () => {
    const onClose = vi.fn();
    render(<DayDetailModal travel={travel} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
