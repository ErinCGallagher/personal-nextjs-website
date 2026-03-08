CREATE TABLE IF NOT EXISTS travel_itinerary (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  hotel VARCHAR(255),
  flight VARCHAR(255),
  rental_car VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_travel_itinerary_date ON travel_itinerary(date);
CREATE INDEX IF NOT EXISTS idx_travel_itinerary_country ON travel_itinerary(country);
