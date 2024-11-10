import { relations } from "drizzle-orm";
import { pgTable, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { User } from "./auth";

export const Destination = pgTable("destination", (t) => ({
  id: t.bigserial("id", { mode: "number" }).primaryKey(),
  name: t.text("name").notNull(),
  country: t.text("country").notNull(),
  description: t.text("description"),
}));

export const Trip = pgTable("trip", (t) => ({
  id: t.bigserial("id", { mode: "number" }).primaryKey(),
  name: t.text("name").notNull(),
  startDate: t.date("start_date").notNull(),
  endDate: t.date("end_date").notNull(),
  price: t.numeric("price", { precision: 10, scale: 2 }).notNull(),
  description: t.text("description"),
}));

export const Booking = pgTable("booking", (t) => ({
  id: t.bigserial("id", { mode: "number" }).primaryKey(),
  userId: t
    .uuid("user_id")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  tripId: t
    .bigint("trip_id", { mode: "number" })
    .notNull()
    .references(() => Trip.id),
  bookingDate: t.date("booking_date").notNull(),
  status: t.text("status").notNull(),
}));

export const TripDestination = pgTable(
  "trip_destination",
  (t) => ({
    tripId: t
      .bigint("trip_id", { mode: "number" })
      .notNull()
      .references(() => Trip.id),
    destinationId: t
      .bigint("destination_id", { mode: "number" })
      .notNull()
      .references(() => Destination.id),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.tripId, t.destinationId] }),
  }),
);

// Relations
export const TripRelations = relations(Trip, ({ many }) => ({
  bookings: many(Booking),
  tripDestinations: many(TripDestination),
}));

export const BookingRelations = relations(Booking, ({ one }) => ({
  user: one(User, { fields: [Booking.userId], references: [User.id] }),
  trip: one(Trip, { fields: [Booking.tripId], references: [Trip.id] }),
}));

export const DestinationRelations = relations(Destination, ({ many }) => ({
  tripDestinations: many(TripDestination),
}));

export const TripDestinationRelations = relations(
  TripDestination,
  ({ one }) => ({
    trip: one(Trip, {
      fields: [TripDestination.tripId],
      references: [Trip.id],
    }),
    destination: one(Destination, {
      fields: [TripDestination.destinationId],
      references: [Destination.id],
    }),
  }),
);

// Schemas
export const CreateTripSchema = createInsertSchema(Trip, {
  name: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  price: z.number().positive(),
  description: z.string().optional(),
}).omit({
  id: true,
});
