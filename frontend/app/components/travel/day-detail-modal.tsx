/** Full-screen modal showing details for a selected travel day. */

"use client";

import { useEffect } from "react";
import { FaTimes, FaHotel } from "react-icons/fa";
import { getCountryFlag } from "@/app/lib/color-utils";
import type { TravelEntry } from "./calendar-utils";

interface DayDetailModalProps {
  travel: TravelEntry;
  onClose: () => void;
}

export default function DayDetailModal({ travel, onClose }: DayDetailModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-8 sm:p-10 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Close modal"
        >
          <FaTimes className="text-xl" />
        </button>

        <div className="text-base sm:text-lg text-grey-blue mb-3">
          {new Date(travel.date).toLocaleDateString("en-CA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <span className="text-3xl sm:text-4xl">{getCountryFlag(travel.country)}</span>
          <span>{travel.country}</span>
        </h2>
        <h3 className="text-xl sm:text-2xl text-grey-blue mb-6 font-semibold">
          {travel.city}
        </h3>

        <div className="space-y-5">
          {travel.hotel && (
            <div className="flex items-start gap-3">
              <FaHotel className="text-grey-blue text-xl mt-1" />
              <div>
                <div className="text-sm font-semibold text-grey-blue mb-1">Hotel</div>
                <div className="text-xl font-medium">{travel.hotel}</div>
              </div>
            </div>
          )}

          {travel.flight && (
            <div className="flex items-start gap-3">
              <span className="text-2xl">✈️</span>
              <div>
                <div className="text-sm font-semibold text-grey-blue mb-1">Flight</div>
                <div className="text-lg">{travel.flight}</div>
              </div>
            </div>
          )}

          {travel.rental_car && (
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚗</span>
              <div>
                <div className="text-sm font-semibold text-grey-blue mb-1">Rental Car</div>
                <div className="text-lg">{travel.rental_car}</div>
              </div>
            </div>
          )}

          {travel.notes && (
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <div className="text-sm font-semibold text-grey-blue mb-1">Notes</div>
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {travel.notes}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
